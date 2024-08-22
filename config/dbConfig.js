require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Terhubung ke database!");
    return connection;
  } catch (error) {
    console.error("Koneksi database gagal:", error);
    throw error;
  }
}

module.exports = { pool, getConnection };
