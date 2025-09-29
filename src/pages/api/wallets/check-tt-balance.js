import { getTTBalance } from "@/services/Contract";
import { CdpClient } from "@coinbase/cdp-sdk";
import { formatEther } from "ethers";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;

export const GET = async ({ request }) => {
  try {
    const path = new URL(request.url); // full URL object
    const params = path.searchParams; // URLSearchParams object

    const username = params.get("username");

    const cdp = new CdpClient({
      apiKeyId: CDP_API_KEY_ID,
      apiKeySecret: CDP_API_KEY_SECRET,
      walletSecret: CDP_WALLET_SECRET,
    });

    const player = await cdp.evm.getOrCreateAccount({
      name: username,
    });

    const result = await getTTBalance({ address: player.address });

    return new Response(
      JSON.stringify({ success: true, balance: formatEther(result) }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
};
