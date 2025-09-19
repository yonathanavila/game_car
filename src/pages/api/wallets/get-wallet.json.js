import { CdpClient } from "@coinbase/cdp-sdk";

export default async function GET({ params }) {
  const {
    account: { address, owner },
  } = params;

  const cdp = new CdpClient();

  const namedSmartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: address,
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
