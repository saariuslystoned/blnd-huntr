import { Asset } from "@stellar/stellar-sdk";
import { appendFileSync, existsSync } from "fs";
import { readAggregateLossCsv, assetFromString } from "./reader.js";
import { stellar_horizon } from "./config.js";
import { payment, createClaimableBalance } from "./submit.js";

const LOG_HEADERS = "account,destination,asset,amount,transaction_hash\n";

if (process.argv.length < 3) {
  throw new Error("Arguments required: `asset` (e.g. C...)");
}

const asset = assetFromString(process.argv[2]);

// throw new Error("NOT READY");

await executeRemediation(asset);

/**
 * Execute the remediation process for a given asset by reading the aggregate loss CSV and submitting payments to affected accounts.
 * Creates a transaction log of all impacted accounts.
 * @param {Asset} asset
 */
export async function executeRemediation(asset) {
  const LOG_FILE_DEST = `./logs/${new Date().toISOString()}_remediation_log_${asset.code.toLocaleUpperCase()}.csv`;
  const WARN_FILE_DEST = `./logs/${new Date().toISOString()}_remediation_warnings_${asset.code.toLocaleUpperCase()}.csv`;
  const ERROR_FILE_DEST = `./logs/${new Date().toISOString()}_remediation_errors_${asset.code.toLocaleUpperCase()}.csv`;

  if (!existsSync(LOG_FILE_DEST)) {
    appendFileSync(LOG_FILE_DEST, LOG_HEADERS);
  }

  let entries = readAggregateLossCsv(asset);
  console.log(
    `Starting processing for ${asset.code}. Total entries: ${entries.length}`,
  );

  await new Promise((resolve) => setTimeout(resolve, 5000));

  for (let entry of entries) {
    try {
      console.log("Processing entry:", entry);

      if (Number(entry.amount) < 0.01) {
        console.warn(
          `Amount for account ${entry.account} is below threshold. Skipping entry.`,
        );
        appendFileSync(
          WARN_FILE_DEST,
          `${entry.account},${entry.destination},${entry.asset.code},${entry.amount},Amount below threshold\n`,
        );
        continue;
      }

      // Load destination and validate it exists
      let destination;
      try {
        destination = await stellar_horizon.loadAccount(entry.destination);
      } catch (error) {
        if (error?.status === 404 || error?.message == "Not Found") {
          console.warn(
            `Destination account ${entry.destination} does not exist. Skipping entry for account ${entry.account}.`,
          );
          appendFileSync(
            WARN_FILE_DEST,
            `${entry.account},${entry.destination},${entry.asset.code},${entry.amount},Account does not exist\n`,
          );
          continue;
        } else {
          throw error;
        }
      }

      let hasTrustline = false;
      if (!asset.isNative()) {
        // Check if the destination maintains a trustline
        hasTrustline = destination.balances.some(
          (balance) =>
            balance.asset_code === entry.asset.code &&
            balance.asset_issuer === entry.asset.issuer &&
            Number(balance.limit) - Number(balance.balance) >=
              Number(entry.amount),
        );
      } else {
        hasTrustline = true;
      }

      if (!hasTrustline) {
        console.warn(
          `Destination account ${entry.destination} does not have a trustline for ${entry.asset.code}.`,
        );
        appendFileSync(
          WARN_FILE_DEST,
          `${entry.account},${entry.destination},${entry.asset.code},${entry.amount},No trustline - submitting claimable balance\n`,
        );
        let txHash = await createClaimableBalance(
          entry.asset,
          entry.destination,
          entry.amount,
        );
        appendFileSync(
          LOG_FILE_DEST,
          `${entry.account},${entry.destination},${entry.asset.code},${entry.amount},${txHash}\n`,
        );
      } else {
        let txHash = await payment(
          entry.asset,
          entry.destination,
          entry.amount,
        );
        appendFileSync(
          LOG_FILE_DEST,
          `${entry.account},${entry.destination},${entry.asset.code},${entry.amount},${txHash}\n`,
        );
      }
      console.log("Entry processed successfully:", entry.account);
    } catch (error) {
      console.error(
        `Error processing entry for account ${entry.account}:`,
        error,
      );
      appendFileSync(
        ERROR_FILE_DEST,
        `${entry.account},${entry.destination},${entry.asset.code},${entry.amount},${error.message}\n`,
      );
      throw new Error(
        `Failed to process entry for account ${entry.account}: ${error.message}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
