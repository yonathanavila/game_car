import { createBaseAccountSDK } from "@base-org/account";
import { encodeFunctionData, numberToHex } from "viem";
import { base } from "viem/chains";
import contractAbi from "../../solidity/artifacts/GameLogic_metadata.json";

const PAYMASTER_RPC = import.meta.env.PUBLIC_PAYMASTER_RPC;
const GAME_CONTRACT_ADDRESS = import.meta.env.PUBLIC_GAME_CONTRACT_ADDRESS;

const sdk = createBaseAccountSDK({
  appName: "Taxi Driver",
  appLogoUrl:
    "https://game-car-beta.vercel.app/images/splasharts/taxi_in_game.webp",
  appChainIds: [base.id],
  subAccounts: { creation: "on-connect", defaultAccount: "sub" },
});

const provider = sdk.getProvider();

// TODO: Review the SaveScore structure becouse continue faild the transaction
export async function SaveScore({ score, player, nonce }) {
  const subaccount = await connectAndEnsureSubAccount();

  const responseSign = await fetch("/api/sign-transaction.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      nonce,
      playerAddress: player,
    }),
  });
  const data = await responseSign.json();

  const signature = data.signature;

  const calls = [
    {
      to: GAME_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: contractAbi,
        functionName: "submitScore",
        args: [player, score, nonce, signature],
      }),
    },
  ];

  const response = await sendSponsoredCalls(subaccount.address, calls);

  if (response?.txHash) {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: response.txHash,
    });
    console.log("✅ Transaction confirmed:", receipt);
    return receipt;
  }

  // Some versions return just an ID — handle that too
  if (typeof response === "string") {
    console.log("Transaction submitted, ID:", response);
    return { txId: response };
  }

  throw new Error("Unexpected response from sendSponsoredCalls()");
}

export async function PayTotalAmount({ component, repairCost }) {
  try {
    const subaccount = await connectAndEnsureSubAccount();

    console.log("Sub account is: ", subaccount);

    const calls = [
      {
        abi: contractAbi,
        functionName: "repairVehicle",
        to: GAME_CONTRACT_ADDRESS,
        args: [component, repairCost],
      },
    ];

    const response = await sendSponsoredCalls(subaccount.address, calls);

    console.log("⛓️ Transaction Request:", response);

    if (response?.txHash) {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: response.txHash,
      });
      console.log("✅ Transaction confirmed:", receipt);
      return receipt;
    }

    // Some versions return just an ID — handle that too
    if (typeof response === "string") {
      console.log("Transaction submitted, ID:", response);
      return { txId: response };
    }

    throw new Error("Unexpected response from sendSponsoredCalls()");
  } catch (error) {
    console.error("❌ Error in PayTotalAmount:", error);
    throw error;
  }
}

async function connectAndEnsureSubAccount() {
  const universalAddress = await provider.request({
    method: "wallet_addSubAccount",
    params: [
      {
        account: {
          type: "create",
        },
      },
    ],
  });

  console.log("Sub Account created: ", universalAddress.address);

  // get existing subaccount for this origin
  const result = await provider.request({
    method: "wallet_getSubAccounts",
    params: [
      { account: universalAddress.address, domain: window.location.origin },
    ],
  });

  const subAccount = result?.subAccounts?.[0];

  if (subAccount) {
    console.log("Sub Account found:", subAccount.address);
  } else {
    console.log("No Sub Account exists for this app");
  }

  return subAccount;
}

async function sendSponsoredCalls(subAccountAddress, calls) {
  const response = await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "1.0",
        from: subAccountAddress,
        chainId: numberToHex(base.id),
        calls,
        capabilities: {
          paymasterService: {
            url: PAYMASTER_RPC, // must be live & support your chain
          },
        },
      },
    ],
  });

  console.log("Sponsored calls: ", response);
  return response;
}
