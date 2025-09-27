import { getLeaderboard } from "@/services/Contract";

// src/pages/api/example.ts

export const GET = async ({ request }) => {
  try {
    const url = new URL(request.url); // full URL object
    const params = url.searchParams; // URLSearchParams object

    const offset = params.get("offset");
    const limit = params.get("limit");

    const receipt = await getLeaderboard({
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    return new Response(JSON.stringify({ success: true, tx: receipt }), {
      status: 200,
    });
  } catch (err) {
    console.error("Contract write failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
};
