import { createPublicClient, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { readContract } from "viem/actions";
import { base } from "viem/chains";
import gameAbi from "../../solidity/artifacts/GameLogic_metadata.json";
import tokenAbi from "../../solidity/artifacts/GameToken_metadata.json";

const TOKEN_CONTRACT_ADDRESS = import.meta.env.TOKEN_CONTRACT_ADDRESS;
const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http(config.rpc_url),
  chain: base,
});

export async function getLeaderboard({ offset = 0, limit = 10 }) {
  const decoded = await readContract(publicClient, {
    abi: gameAbi,
    address: GAME_CONTRACT_ADDRESS,
    functionName: "getLeaderboard",
    args: [BigInt(offset), BigInt(limit)], // must be bigint
  });

  const serialized = serializeBigInt(decoded);

  return serialized;
}

export async function getTTBalance({ address }) {
  const decoded = await readContract(publicClient, {
    abi: tokenAbi,
    address: TOKEN_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address], // must be bigint
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
