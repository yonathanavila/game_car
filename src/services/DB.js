import Database from "better-sqlite3";

const db = new Database("database.db");

export const CreateNonce = ({ wallet, nonce }) => {
  try {
    // Insert a new record
    const stmt = db.prepare("INSERT INTO nonces (wallet, nonce) VALUES (?, ?)");
    const result = stmt.run(wallet, nonce);

    return {
      success: true,
      message: "Nonce saved successfully.",
      data: {
        id: result.lastInsertRowid,
        wallet,
        nonce,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error saving nonce.",
      error: error.message,
    };
  }
};

export const GetNonce = ({ wallet }) => {
  try {
    const record = db
      .prepare("SELECT * FROM nonces WHERE wallet = ?")
      .get(wallet);

    return {
      success: true,
      message: "Nonce retrieved successfully.",
      data: record,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error retrieving nonce.",
      error: error.message,
    };
  }
};

/**
 * Updates the nonce value by record ID.
 * @param {number} nonceId - The ID of the nonce record to update.
 * @param {number} newNonce - The new nonce value.
 * @returns {object} { success, message, data? }
 */
export const UpdateNonceById = ({ nonceId, newNonce }) => {
  try {
    const stmt = db.prepare("UPDATE nonces SET nonce = ? WHERE id = ?");
    const result = stmt.run(newNonce, nonceId);

    if (result.changes === 0) {
      return { success: false, message: "Nonce not found or not updated." };
    }

    const updated = db
      .prepare("SELECT * FROM nonces WHERE id = ?")
      .get(nonceId);

    return {
      success: true,
      message: "Nonce updated successfully.",
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating nonce.",
      error: error.message,
    };
  }
};
