import { CdpClient } from "@coinbase/cdp-sdk";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;

export async function POST({ request }) {
  const body = await request.json();

  try {
    const cdp = new CdpClient({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      walletSecret: CDP_WALLET_SECRET,
    });

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
