// TODO: Make this apporuch like a client and make too like a server using normal wallets

import { CdpClient } from "@coinbase/cdp-sdk";
import { privateKeyToAccount } from "viem/accounts";

import { createSmartWallet } from "@coinbase/coinbase-sdk";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;
const PRIVATE_KEY = import.meta.env.ADMIN_PRIVATE_KEY;

export async function POST({ request }) {
  const body = await request.json();

  try {
    const cdp = new CdpClient({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      walletSecret: CDP_WALLET_SECRET,
    });

    const owner = privateKeyToAccount(PRIVATE_KEY);

    const smartWallet = await createSmartWallet({
      signer: owner,
    });

    // Get the smart wallet address
    const smartWalletAddress = smartWallet.address;

    const player = await cdp.evm.getOrCreateAccount({
      name: body.name,
    });

    if (!player.address) {
      return new Response(null, {
        status: 404,
        statusText: "Can't create server wallet",
      });
    }
    return new Response(
      JSON.stringify({
        message: `Your wallet is: ${player.address}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(null, {
      status: 404,
      statusText: "Error: " + error,
    });
  }
}
