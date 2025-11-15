import { getTTBalance } from "@/services/Contract";
import { formatEther } from "ethers";

export const GET = async ({ request }) => {
  try {
    const path = new URL(request.url); // full URL object
    const params = path.searchParams; // URLSearchParams object

    const address = params.get("address");

    const result = await getTTBalance({ address });

    console.log("Result is: ", result);

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
