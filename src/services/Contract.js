import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { config } from "@/services/Wagmi";

import { metaMask } from "wagmi/connectors";
import contractAbi from "../../solidity/artifacts/GameLeaderboardTopN.json";

const contractAddress = "0x2675cD745AE2892d8118B849282788D390b793A5";

// export async function callWrite(score) {
//   // 1. Ensure wallet is connected
//   const connection = await connect(config, {
//     connector: metaMask(), // or another connector you set in config
//   });

//   console.log("Connected:", connection.account);

//   // 2. Write to contract
//   const txHash = await writeContract(config, {
//     address: contractAddress,
//     abi: contractAbi.abi,
//     functionName: "submitScore", // example
//     args: [score],
//     account: connection.account, // important
//   });

//   // 3. Wait for confirmation
//   const receipt = await waitForTransactionReceipt(config, { hash: txHash });

//   console.log("Tx confirmed:", receipt);
// }

export async function callRead() {
  const result = await readContract(config, {
    address: contractAddress,
    abi: contractAbi.abi,
    functionName: "getTopPlayers",
  });

  console.log("Result:", result);
  return result;
}

export async function callWrite(score) {
  const txHash = await writeContract(config, {
    address: contractAddress,
    abi: contractAbi.abi,
    functionName: "submitScore",
    args: [score],
    account: window.connectedAccount, // explicitly pass the connected account
  });

  const receipt = await waitForTransactionReceipt(config, { hash: txHash });
  console.log("Tx confirmed:", receipt);
}
