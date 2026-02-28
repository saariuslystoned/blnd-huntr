import {
  Transaction,
  TransactionBuilder,
  Operation,
  Claimant,
  xdr,
  Memo,
} from "@stellar/stellar-sdk";
import { stellar_horizon, DIST_KEYPAIR, NETWORK } from "./config.js";

/**
 * Create a TransactionBuilder instance for the distribution account.
 * @returns {Promise<TransactionBuilder>} A TransactionBuilder instance for the distribution account
 */
async function distTransactionBuilder() {
  let account = await stellar_horizon.loadAccount(DIST_KEYPAIR.publicKey());
  return new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK,
    memo: Memo.text("YieldBlox Pool Remediation"),
  }).setTimeout(60);
}

/**
 * Sign and submit a Stellar transaction to the network.
 * @param {Transaction} transaction
 * @returns {Promise<string>} The transaction hash
 * @throws {Error} Throws an error if the transaction fails to submit
 */
async function signAndSubmitTransaction(transaction) {
  // return transaction.toXDR();

  try {
    transaction.sign(DIST_KEYPAIR);
    let result = await stellar_horizon.submitTransaction(transaction);
    if (result.successful) {
      console.log("Transaction submitted successfully:", result.hash);
      return result.hash;
    } else {
      throw new Error("Transaction failed: " + result.result_xdr);
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw new Error(`Failed to submit transaction: ${error.message}`);
  }
}

/**
 * Submit a claimable balance for a given claimant destination, asset, and amount.
 * @param {Asset} asset
 * @param {string} destination
 * @param {string} amount
 * @returns {Promise<string>} The transaction hash
 * @throws {Error} Throws an error if the transaction fails to submit
 */
export async function createClaimableBalance(asset, destination, amount) {
  let tx_builder = await distTransactionBuilder();

  let tx = tx_builder
    .addOperation(
      Operation.createClaimableBalance({
        asset: asset,
        amount: amount,
        claimants: [
          new Claimant(destination, Claimant.predicateUnconditional()),
        ],
      }),
    )
    .build();

  return await signAndSubmitTransaction(tx);
}

/**
 * Submit a payment for a given destination, asset, and amount.
 * @param {Asset} asset
 * @param {string} destination
 * @param {string} amount
 * @returns {Promise<string>} The transaction hash
 * @throws {Error} Throws an error if the transaction fails to submit
 */
export async function payment(asset, destination, amount) {
  let tx_builder = await distTransactionBuilder();

  let tx = tx_builder
    .addOperation(
      Operation.payment({
        destination: destination,
        asset: asset,
        amount: amount,
      }),
    )
    .build();

  return await signAndSubmitTransaction(tx);
}
