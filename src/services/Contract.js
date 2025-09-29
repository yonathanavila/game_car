import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { base } from "viem/chains";
import contractAbi from "../../solidity/artifacts/GameLogic_metadata.json";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;
const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function getLeaderboard({ offset = 0, limit = 10 }) {
  const decoded = await readContract(publicClient, {
    abi: contractAbi,
    address: GAME_CONTRACT_ADDRESS,
    functionName: "getLeaderboard",
    args: [BigInt(offset), BigInt(limit)], // must be bigint
  });

  const serialized = serializeBigInt(decoded);

  return serialized;
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
