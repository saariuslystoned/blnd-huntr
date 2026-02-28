import { Asset } from "@stellar/stellar-sdk";
import { readFileSync } from "fs";
import { XLM, USDC, EURC } from "./config.js";

/**
 * Represents a single loss entry parsed from the aggregate loss CSV file.
 */
export class LossEntry {
  /**
   * @param {string} account
   * @param {string} destination
   * @param {Asset} asset
   * @param {string} amount
   */
  constructor(account, destination, asset, amount) {
    this.account = account;
    this.destination = destination;
    this.asset = asset;
    this.amount = amount;
  }
}

/**
 * Reads a CSV file containing aggregate loss data and returns an array of LossEntry objects.
 *
 * @param {Asset} asset
 * @returns {LossEntry[]} An array of LossEntry objects parsed from the CSV file
 */
export function readAggregateLossCsv(asset) {
  let filePath = `./data/aggregate_loss_${asset.code.toLocaleUpperCase()}.csv`;
  let file = readFileSync(filePath, "utf-8");

  let lines = file
    .split("\n")
    .slice(1)
    .filter((line) => line.trim() !== "");
  let entries = lines.map((line) => {
    let data = line.split(",");
    let account = data[0];
    let asset = assetFromString(data[1]);
    let amount = toDecimalString(data[6]);
    let destination = data[7];
    if (destination == undefined || destination === "") {
      destination = account;
    }
    return new LossEntry(account, destination, asset, amount);
  });
  return entries;
}

export function assetFromString(assetStr) {
  switch (assetStr) {
    case "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA":
      return XLM;
    case "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75":
      return USDC;
    case "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV":
      return EURC;
    default:
      throw new Error(`Unknown asset: ${assetStr}`);
  }
}

/**
 * Converts a fixed-point bigint string (7 decimal places) to a human-readable decimal string.
 *
 * @param {string} value - The fixed-point integer as a string
 * @returns {string} The decimal string representation
 */
export function toDecimalString(value, decimals = 7) {
  const padded = value.padStart(decimals + 1, "0");
  const intPart = padded.slice(0, padded.length - decimals);
  const fracPart = padded.slice(padded.length - decimals);
  return `${intPart}.${fracPart}`;
}
