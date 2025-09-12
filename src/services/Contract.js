import { readContract } from "wagmi/actions";
import { config } from "@/services/Wagmi";
import contractAbi from "../../solidity/artifacts/GameLeaderboardTopN.json";

const contractAddress = "0x5a92F373CfD75803DfB6abFd491a86636b791c64";
export async function callRead() {
  let result = null;
  try {
    result = await readContract(config, {
      address: contractAddress,
      abi: contractAbi.abi,
      functionName: "getTopPlayers",
    });
  } catch (error) {
    console.log("Error: ", error);
  }
  return result;
}
