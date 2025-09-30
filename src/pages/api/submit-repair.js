import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { base } from "viem/chains";
import gameContractAbi from "../../../solidity/artifacts/GameLogic_metadata.json";
import tokenContractAbi from "../../../solidity/artifacts/GameToken_metadata.json";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;
const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;
const TOKEN_CONTRACT_ADDRESS = import.meta.env.TOKEN_CONTRACT_ADDRESS;

const ADMIN_WALLET_NAME = import.meta.env.ADMIN_WALLET_NAME;

const cdp = new CdpClient({
  apiKeyId: CDP_API_KEY_ID,
  apiKeySecret: CDP_API_KEY_SECRET,
  walletSecret: CDP_WALLET_SECRET,
});

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const component = parseInt(formData.get("component"));
  const repairCost = formData.get("repairCost");

  // get or create the admin account
  const admin = await cdp.evm.getAccount({
    name: ADMIN_WALLET_NAME,
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
  console.log("Submitting repair cost:", {
    component,
    repairCost,
  });

  // make allowance
  const allowance = encodeFunctionData({
    abi: tokenContractAbi,
    functionName: "approve",
    args: [GAME_CONTRACT_ADDRESS, repairCost],
  });

  const allowanceResult = await cdp.evm.sendTransaction({
    address: admin.address,
    transaction: {
      to: TOKEN_CONTRACT_ADDRESS,
      allowance,
    },
    network: "base",
  });

  console.log("Allowance sent:", allowanceResult.transactionHash);

  // send transaction
  const data = encodeFunctionData({
    abi: gameContractAbi,
    functionName: "repairCost",
    args: [component, repairCost],
  });

  const transactionResult = await cdp.evm.sendTransaction({
    address: admin.address,
    transaction: {
      to: GAME_CONTRACT_ADDRESS,
      data,
    },
    network: "base",
  });

  console.log("Transaction sent:", transactionResult.transactionHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionResult.transactionHash,
  });

  console.log(`Tx confirmed in block ${receipt.blockNumber} ✅`);
  return new Response(
    JSON.stringify({ success: true, tx: receipt.transactionHash }),
    { status: 200 }
  );
};
