import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";
import contractAbi from "../../solidity/artifacts/GameLogic_metadata.json";

const PAYMASTER_RPC = import.meta.env.PAYMASTER_RPC;
const GAME_CONTRACT_ADDRESS = import.meta.env.GAME_CONTRACT_ADDRESS;

const sdk = createBaseAccountSDK({
  appName: "TaxiDriver",
  appChainIds: [base.id],
  subAccounts: { creation: "on-connect", defaultAccount: "sub" },
});

const provider = sdk.getProvider();

export async function PayTotalAmount({ component, repairCost }) {
  try {
    const subaccount = await connectAndEnsureSubAccount();

    const calls = [
      {
        abi: contractAbi,
        functionName: "repairVehicle",
        to: GAME_CONTRACT_ADDRESS,
        args: [component, repairCost],
      },
    ];

    const response = await sendSponsoredCalls(subaccount, calls);

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
  // triggers passkey prompt / connect
  const accounts = await provider.request({
    method: "eth_requestAccounts",
    params: [],
  });
  const universal = accounts[0];

  // get existing subaccount for this origin
  const subResp = await provider.request({
    method: "wallet_getSubAccounts",
    params: [{ account: universal, domain: window.location.origin }],
  });

  if (subResp?.subAccounts?.length > 0) {
    return subResp.subAccounts[0];
  }

  const newSub = await provider.request({
    method: "wallet_addSubAccount",
    params: [{ account: { type: "create" } }],
  });

  return newSub;
}

async function sendSponsoredCalls(subAccountAddress, calls) {
  const response = await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0",
        atomicRequired: true,
        from: subAccountAddress,
        calls,
        capabilities: {
          paymasterService: {
            url: PAYMASTER_RPC, // must be live & support your chain
          },
        },
      },
    ],
  });

  console.log("Transaction ID:", response);
  return response;
}
