import { CreateNonce, GetNonce } from "@/services/DB";
import gameAbi from "../../../solidity/artifacts/GameLogic_metadata.json";
const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;

export const GET = async ({ request }) => {
  try {
    const path = new URL(request.url);
    const params = path.searchParams;

    const walletAddress = params.walletAddress;

    // Get nonce
    const nonce = await GetNonce({ address: walletAddress });

    const decoded = await readContract(publicClient, {
      abi: gameAbi,
      address: GAME_CONTRACT_ADDRESS,
      functionName: "usedNonces",
      args: [address], // must be bigint
    });
    // Create nonce first

    CreateNonce({ walletAddress });
  } catch (error) {}
};
