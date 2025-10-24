// TODO: Make this apporuch using the smartwallet or the normal wallet of the user

import { getLeaderboard } from "@/services/Contract";

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
        return {
          name: player.player,
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
