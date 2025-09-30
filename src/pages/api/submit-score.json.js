// TODO: Make this apporuch like a client and make too like a server using normal wallets

import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http } from "viem";
import {
  createBundlerClient,
  createEIP4337Account,
} from "viem/account-abstraction";
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
  try {
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

    // create an account abstraction for the admin wallet
    const adminAccount = createEIP4337Account({
      client: publicClient,
      chain: base,
      secretKey: admin.privateKey, // admin.privateKey from CDP
    });

    const bundlerClient = createBundlerClient({
      account: adminAccount,
      client: publicClient,
      transport: http(),
      chain: base,
    });

    console.log("Admin account:", admin);
    console.log("Player account:", player);

    // Prepare UserOperation
    const userOp = {
      calls: [
        {
          abi: contractAbi,
          functionName: "submitScore",
          to: GAME_CONTRACT_ADDRESS,
          args: [player.address, score],
        },
      ],
      paymaster: true, // This tells the bundler to use the Paymaster
      estimateGas: async (userOperation) => {
        const estimate = await bundlerClient.estimateUserOperationGas(
          userOperation
        );
        // Optional: increase preVerificationGas to avoid underestimation
        estimate.preVerificationGas = estimate.preVerificationGas * 2n;
        return estimate;
      },
    };

    // Send UserOperation
    const userOpHash = await bundlerClient.sendUserOperation(userOp);

    // Wait for confirmation
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    console.log("✅ Transaction successfully sponsored!");
    console.log(
      `⛽ View UserOperation: https://base-sepolia.blockscout.com/op/${receipt.userOpHash}`
    );
    console.log(
      `🔍 View transaction for player: https://sepolia.basescan.org/address/${player.address}`
    );

    return new Response(
      JSON.stringify({ success: true, tx: receipt.transactionHash }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending transaction:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
};
