const { pool } = require("../config/dbConfig");

async function saveMessage(number, sender, message) {
  try {
    const [rows] = await pool.execute(
      "INSERT INTO messages (number, sender, message) VALUES (?, ?, ?)",
      [number, sender, message]
    );

    console.log("Pesan berhasil disimpan ke database:", rows);
  } catch (error) {
    console.error("Gagal menyimpan pesan ke database:", error);
  }
}

module.exports = { saveMessage };
