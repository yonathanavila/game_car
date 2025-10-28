import Database from "better-sqlite3";

const db = new Database("database.db");

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { wallet, nonce } = req.body;

    if (!wallet || !nonce) {
      return res.status(400).json({ error: "Missing wallet or nonce" });
    }

    // Optionally ensure uniqueness per wallet
    const existing = db
      .prepare("SELECT * FROM nonces WHERE wallet = ?")
      .get(wallet);

    if (existing) {
      // Update the existing nonce
      db.prepare("UPDATE nonces SET nonce = ? WHERE wallet = ?").run(
        nonce,
        wallet
      );

      return res.status(200).json({
        message: "Nonce updated",
        wallet,
        nonce,
      });
    } else {
      // Insert a new record
      const stmt = db.prepare(
        "INSERT INTO nonces (wallet, nonce) VALUES (?, ?)"
      );
      const result = stmt.run(wallet, nonce);

      return res.status(201).json({
        message: "Nonce saved",
        id: result.lastInsertRowid,
        wallet,
        nonce,
      });
    }
  } catch (error) {
    console.error("❌ Error saving nonce:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
