import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { readContract } from "viem/actions";
import { baseSepolia } from "viem/chains";
import contractAbi from "../../solidity/artifacts/GameLogic_metadata.json";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;
const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;
const ADMIN_WALLET_NAME = import.meta.env.ADMIN_WALLET_NAME;

const cdp = new CdpClient({
  apiKeyId: CDP_API_KEY_ID,
  apiKeySecret: CDP_API_KEY_SECRET,
  walletSecret: CDP_WALLET_SECRET,
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function getLeaderboard({ offset = 0, limit = 10 }) {
  const decoded = await readContract(publicClient, {
    abi: contractAbi.output.abi,
    address: GAME_CONTRACT_ADDRESS,
    functionName: "getLeaderboard",
    args: [BigInt(offset), BigInt(limit)], // must be bigint
  });
  const response = // convert bigint to string
    decoded.map((x) => x.toString());

  console.log("Leaderboard:", response);

  console.log("Tx confirmed: ", response);

  const serialized = serializeBigInt(decoded);

  return serialized;
}

export async function submitScore({ baseAccountName, score }) {
  // get or create the admin account
  const admin = await cdp.evm.getAccount({
    name: ADMIN_WALLET_NAME,
  });

  // get the player account
  const player = await cdp.evm.getAccount({
    name: baseAccountName,
  });

  // // request eth to the faucet
  // const { transactionHash: faucetTransactionHash } =
  //   await cdp.evm.requestFaucet({
  //     address: admin.address,
  //     network: "base-sepolia",
  //     token: "eth",
  //   });

  // const faucetTxReceipt = await publicClient.waitForTransactionReceipt({
  //   hash: faucetTransactionHash,
  // });

  // console.log(
  //   "Successfully requested ETH from faucet:",
  //   faucetTxReceipt.transactionHash
  // );
  console.log("Submitting score:", {
    player: player.address,
    score,
    admin: admin.address,
  });

  // send transaction
  const data = encodeFunctionData({
    abi: contractAbi.output.abi,
    functionName: "submitScore",
    args: [player.address, score],
  });

  const transactionResult = await cdp.evm.sendTransaction({
    address: admin.address,
    transaction: {
      to: GAME_CONTRACT_ADDRESS,
      data,
    },
    network: "base-sepolia",
  });

  console.log("Transaction sent:", transactionResult.transactionHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionResult.transactionHash,
  });

  console.log(`Tx confirmed in block ${receipt.blockNumber} ✅`);
  return receipt;
}

function serializeBigInt(obj) {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    );
  }
  return obj;
}
