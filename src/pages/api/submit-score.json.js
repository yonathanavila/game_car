import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { base } from "viem/chains";
import contractAbi from "../../../solidity/artifacts/GameLogic_metadata.json";

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
  chain: base,
  transport: http(),
});

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const score = parseInt(formData.get("score"));
  const baseAccountName = formData.get("player");

  // get or create the admin account
  const admin = await cdp.evm.getAccount({
    name: ADMIN_WALLET_NAME,
  });

  // get the player account
  const player = await cdp.evm.getAccount({
    name: baseAccountName,
  });

  console.log("Admin account:", admin);
  console.log("Player account:", player);

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
    abi: contractAbi,
    functionName: "submitScore",
    args: [player.address, score],
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
