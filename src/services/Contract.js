import contractAbi from "@@/solidity/artifacts/GameLogic_metadata.json";
import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { baseSepolia } from "viem/chains";

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
  chain: baseSepolia,
  transport: http(),
});

export async function getLeaderboard(offset, limit) {
  // create tx
  const data = encodeFunctionData({
    abi: contractAbi.output.abi,
    functionName: "getLeaderboard",
    args: [offset, limit],
  });

  const result = await cdp.eth_call({
    to: GAME_CONTRACT_ADDRESS,
    data,
  });

  // 3. Decode the result
  const decoded = decodeFunctionResult({
    abi,
    functionName: "balanceOf",
    data: result,
  });

  console.log("Tx confirmed: ", decoded);

  return decoded;
}

export async function submitScore(baseAccountName, score) {
  // get or create the admin account
  const admin = await cdp.evm.getAccount({
    name: ADMIN_WALLET_NAME,
  });

  // get the player account
  const player = await cdp.evm.getAccount({
    name: baseAccountName,
  });

  // request eth to the faucet
  const { transactionHash: faucetTransactionHash } =
    await cdp.evm.requestFaucet({
      address: admin.address,
      network: "base-sepolia",
      token: "eth",
    });

  const faucetTxReceipt = await publicClient.waitForTransactionReceipt({
    hash: faucetTransactionHash,
  });

  console.log(
    "Successfully requested ETH from faucet:",
    faucetTxReceipt.transactionHash
  );

  // send transaction
  const data = encodeFunctionData({
    abi: contractAbi.output.abi,
    functionName: "submitScore",
    args: [player.address, score],
  });

  const transactionResult = await cdp.evm.sendTransaction({
    address: admin.address,
    transaction: {
      to: GAME_CONTRACT_ADDRESS,
      data,
    },
    network: "base-sepolia",
  });

  console.log("Transaction sent:", transactionResult.transactionHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txResult.transactionHash,
  });

  console.log(`Tx confirmed in block ${receipt.blockNumber} ✅`);
  return receipt;
}
