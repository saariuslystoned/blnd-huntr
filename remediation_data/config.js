import { Networks, Horizon, Keypair, rpc, Asset } from "@stellar/stellar-sdk";

export const NETWORK = Networks.PUBLIC;
const RPC_URL = "https://rpc.lightsail.network/";
const HORIZON_URL = "https://horizon.stellar.org/";

export const XLM = Asset.native();
export const USDC = new Asset(
  "USDC",
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
);
export const EURC = new Asset(
  "EURC",
  "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
);

export const YBX_POOL =
  "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS";

// export const DIST_KEYPAIR = Keypair.fromPublicKey(process.env.DIST_KEYPAIR);
export const DIST_KEYPAIR = Keypair.fromSecret(process.env.DIST_KEYPAIR);

export const stellar_rpc = new rpc.Server(RPC_URL);
export const stellar_horizon = new Horizon.Server(HORIZON_URL);
