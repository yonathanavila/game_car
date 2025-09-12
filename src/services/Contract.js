import { readContract } from "wagmi/actions";
import { config } from "@/services/Wagmi";
import contractAbi from "../../solidity/artifacts/abi.json";

const contractAddress = import.meta.env.CONTRACT_ADDRESS;

export async function callReadTopPlayers() {
  const topPlayers = [];
  const topScores = [];

  try {
    // The contract has 10 top players
    for (let i = 0; i < 10; i++) {
      // Read player address
      const player = await readContract(config, {
        address: contractAddress,
        abi: contractAbi,
        functionName: "topPlayers",
        args: [i],
      });

      // Read player score
      const score = await readContract(config, {
        address: contractAddress,
        abi: contractAbi,
        functionName: "topScores",
        args: [i],
      });

      topPlayers.push(player);
      topScores.push(score);
    }

    return { topPlayers, topScores };
  } catch (error) {
    console.error("Error reading top players:", error);
    return null;
  }
}
