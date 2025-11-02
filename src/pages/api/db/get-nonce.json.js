import { GetNonce } from "@/services/DB";

export const GET = async ({ url }) => {
  try {
    const wallet = url.searchParams.get("wallet");

    if (!wallet) {
      return new Response(
        JSON.stringify({ error: "Missing wallet parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const record = GetNonce({ wallet });

    const status = result.success ? 200 : 400;

    return new Response(JSON.stringify(record), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching nonce:", error);
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
