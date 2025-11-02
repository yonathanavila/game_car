import { CreateNonce } from "@/services/DB";

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const wallet = body?.wallet;
    const nonce = body?.nonce;

    const response = CreateNonce({ wallet, nonce });

    const status = response.success ? 200 : 400;

    return new Response(JSON.stringify(response), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unexpected error saving the nonce.",
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
