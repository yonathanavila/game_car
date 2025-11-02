import { ethers } from "ethers";

// Your server-side wallet (must be private!)
const SERVER_PRIVATE_KEY = import.meta.env.ADMIN_PRIVATE_KEY;
const signer = new ethers.Wallet(SERVER_PRIVATE_KEY);

export async function signScore(playerAddress, score, nonce) {
  const intScore = Math.floor(score);
  // Hash the data
  const hash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [playerAddress, intScore, nonce]
  );

  // Sign the hash (Ethereum signed message)
  const signature = await signer.signMessage(ethers.getBytes(hash));
  console.log(signature);
  return signature;
}

export const POST = async ({ request }) => {
  const body = await request.json();
  const score = body.score;
  const nonce = body.nonce;
  const playerAddress = body.playerAddress;

  const response = await signScore(playerAddress, score, nonce);
  return new Response(JSON.stringify({ success: true, signature: response }), {
    status: 200,
  });
};
