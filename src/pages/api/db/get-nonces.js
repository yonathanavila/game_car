import Database from "better-sqlite3";

const db = new Database("database.db");

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ error: "Missing wallet parameter" });
    }

    const record = db
      .prepare("SELECT * FROM nonces WHERE wallet = ?")
      .get(wallet);

    if (!record) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("❌ Error fetching nonce:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
