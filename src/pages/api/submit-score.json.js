import { submitScore } from "@/services/Contract";

export const POST = async ({ request }) => {
  try {
    const form = await request.formData();
    const score = form.get("score");
    const player = form.get("player");

    const receipt = await submitScore({
      baseAccountName: player,
      score,
    });

    return new Response(
      JSON.stringify({ success: true, tx: receipt.transactionHash }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Contract write failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
};
