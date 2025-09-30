// TODO: Make this apporuch using the smartwallet or the normal wallet of the user

import { getLeaderboard } from "@/services/Contract";
import { generateJwt } from "@coinbase/cdp-sdk/auth";

const CDP_API_KEY_ID = import.meta.env.CDP_API_KEY_ID;
const CDP_API_KEY_SECRET = import.meta.env.CDP_API_KEY_SECRET;
const CDP_WALLET_SECRET = import.meta.env.CDP_WALLET_SECRET;

export const GET = async ({ request }) => {
  try {
    const path = new URL(request.url); // full URL object
    const params = path.searchParams; // URLSearchParams object

    const offset = params.get("offset");
    const limit = params.get("limit");

    const receipt = await getLeaderboard({
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    const data = await Promise.all(
      receipt.map(async (player) => {
        const url = `https://api.cdp.coinbase.com/platform/v2/evm/accounts/${player.player}`;

        const token = await generateJwt({
          apiKeyId: CDP_API_KEY_ID,
          apiKeySecret: CDP_API_KEY_SECRET,
          requestMethod: "GET",
          requestHost: "api.cdp.coinbase.com",
          requestPath: `/platform/v2/evm/accounts/${player.player}`,
          expiresIn: 120, // optional (defaults to 120 seconds)
        });

        const options = {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          body: undefined,
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`CDP API error ${response.status}: ${text}`);
        }

        return {
          name: data.name,
          score: player.score,
        };
      })
    );

    return new Response(JSON.stringify({ success: true, tx: data }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
};
