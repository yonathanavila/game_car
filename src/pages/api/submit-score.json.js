// TODO: Make this apporuch like a client and make too like a server using normal wallets

import { createPublicClient, http } from "viem";
import {
  createBundlerClient,
  toCoinbaseSmartAccount,
} from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import contractAbi from "../../../solidity/artifacts/GameLogic_metadata.json";

const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;
const PAYMASTER_RPC = import.meta.env.PAYMASTER_RPC;
const ADMIN_PVKEY = import.meta.env.ADMIN_PRIVATE_KEY?.trim();
const RCP_URL = import.meta.env.RCP_URL;

const publicClient = createPublicClient({
  chain: base,
  transport: http(RCP_URL),
});
const owner = privateKeyToAccount(ADMIN_PVKEY);

export const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const score = parseInt(formData.get("score"));
    const player = formData.get("player");

    console.log("Not enter yet to create coinbase smart account");

    // create an account abstraction for the admin wallet
    const adminAccount = await toCoinbaseSmartAccount({
      client: publicClient,
      owner: [owner],
    });

    console.log("Enter to create coinbase smart account");
    const bundlerClient = createBundlerClient({
      account: adminAccount,
      client: publicClient,
      transport: http(PAYMASTER_RPC),
      chain: base,
    });

    console.log("Enter to create coinbase smart account #2");

    console.log("Admin account:", admin);
    console.log("Player account:", player);

    // Prepare UserOperation
    const calls = [
      {
        abi: contractAbi,
        functionName: "repairVehicle",
        to: GAME_CONTRACT_ADDRESS,
        args: [player, score],
      },
    ];

    try {
      // Send UserOperation
      const userOpHash = await bundlerClient.sendUserOperation({
        account: adminAccount,
        calls,
        paymaster: true,
      });

      console.log("✅ Transaction successfully sponsored!");
      console.log(
        `⛽ View UserOperation: https://base-sepolia.blockscout.com/op/${receipt.userOpHash}`
      );
      console.log(
        `🔍 View transaction: https://sepolia.basescan.org/address/${adminAccount.address}`
      );
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  } catch (error) {
    console.error("Error sending transaction:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
};
