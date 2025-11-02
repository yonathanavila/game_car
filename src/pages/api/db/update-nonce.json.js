import { UpdateNonceById } from "@/services/DB";

export const POST = async ({ request }) => {
  try {
    const { nonceId, nonce } = await request.json();
    console.log(nonceId, nonce);

    if (!nonceId || nonce === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields: nonceId or nonce.",
        }),
        { status: 400 }
      );
    }

    const result = UpdateNonceById({ nonceId, newNonce: nonce });

    const status = result.success ? 200 : 400;

    return new Response(JSON.stringify(result), { status });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unexpected error updating nonce.",
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
