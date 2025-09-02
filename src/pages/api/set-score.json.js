import { ethers } from "ethers";
import contractAbi from "../../../solidity/artifacts/GameLeaderboardTopN.json";

const privateKey = import.meta.env.PRIVATE_KEY;
const rpcUrl = import.meta.env.RCP_URL;
const contractAddress = import.meta.env.CONTRACT_ADDRESS;

export const POST = async ({ request }) => {
  try {
    const form = await request.formData();
    const score = form.get("score");
    const address = form.get("address");

    console.log(contractAddress, rpcUrl, privateKey);
    const receipt = await callWrite(address, Math.round(score));

    return new Response(
      JSON.stringify({ success: true, tx: receipt.transactionHash }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Contract write failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
};

async function callWrite(address, score) {
  // Create provider & wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Create contract instance
  const contract = new ethers.Contract(
    contractAddress,
    contractAbi.abi,
    wallet
  );

  // Send tx
  const tx = await contract.submitScore(address, score);
  console.log("Tx sent:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("Tx confirmed:", receipt.transactionHash);

  return receipt;
}
