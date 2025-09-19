import { CdpClient } from "@coinbase/cdp-sdk";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;

export default async function POST() {
  const cdp = new CdpClient({
    apiKeyId: CDP_API_KEY_ID,
    apiKeySecret: CDP_API_KEY_SECRET,
    walletSecret: CDP_WALLET_SECRET,
  });

  const account = await cdp.evm.createAccount();

  const smartAccount = await cdp.evm.createSmartAccount({
    owner: account,
  });

  if (!smartAccount.address) {
    return new Response(null, {
      status: 404,
      statusText: `Smart contract wanst created`,
    });
  }

  console.log(`Created Smart Account. Address: ${smartAccount.address}`);

  return new Response(JSON.stringify(smartAccount.address), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
