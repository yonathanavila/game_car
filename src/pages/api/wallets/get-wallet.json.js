import { CdpClient } from "@coinbase/cdp-sdk";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;

export async function POST({ request }) {
  const body = await request.json();

  console.log(body.address);

  const cdp = new CdpClient({
    apiKeyId: CDP_API_KEY_ID,
    apiKeySecret: CDP_API_KEY_SECRET,
    walletSecret: CDP_WALLET_SECRET,
  });

  const owner = await cdp.evm.getOrCreateAccount({
    name: body.address,
  });

  const namedSmartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: body.address,
    owner: owner,
  });

  if (!namedSmartAccount.address) {
    return new Response(null, {
      status: 404,
      statusText: "Can't created smart account",
    });
  }
  return new Response(JSON.stringify(namedSmartAccount), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
