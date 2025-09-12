import { ethers } from "ethers";
import contractAbi from "../../../solidity/artifacts/abi.json";

const privateKey = import.meta.env.PRIVATE_KEY;
const rpcUrl = import.meta.env.RCP_URL;
const contractAddress = import.meta.env.CONTRACT_ADDRESS;
const maxFeeInEth = import.meta.env.MAX_FEE_IN_ETH;

export const POST = async ({ request }) => {
  try {
    const form = await request.formData();
    const score = form.get("score");
    const address = form.get("address");

    console.log(score, address);

    const receipt = await callWrite(address, BigInt(Math.round(score)));

    if (!receipt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Transaction aborted due to high fee",
        }),
        { status: 400 }
      );
    }

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

async function callWrite(playerAddr, score) {
  if (!playerAddr || !score) throw new Error("Missing player address or score");

  // Initialize provider & wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Contract instance
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  // Use a safe fixed gas limit
  const gasLimit = 500_000n;

  // Get current gas price
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? 20_000_000_000n; // fallback 20 gwei

  // Approximate total fee in ETH
  const totalFeeInEth = Number(ethers.formatEther(gasPrice * gasLimit));
  console.log(`Approx fee: ${totalFeeInEth} ETH, max allowed: ${maxFeeInEth}`);

  if (totalFeeInEth > maxFeeInEth) {
    console.log("Transaction too expensive, aborting");
    return null;
  }

  // Send transaction directly without estimateGas
  const tx = await contract.submitScore(playerAddr, score, { gasLimit });
  console.log("Tx sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Tx confirmed:", receipt.transactionHash);
  return receipt;
}
