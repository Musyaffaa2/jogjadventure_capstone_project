// config/database.js
const mysql = require('mysql2/promise');

// Konfigurasi database
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Sesuaikan dengan password MySQL Anda
  database: 'tourism',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Membuat connection pool
const pool = mysql.createPool(dbConfig);

// Fungsi untuk test koneksi
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database MySQL terhubung dengan sukses!');
    connection.release();
  } catch (error) {
    console.error('❌ Error koneksi database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection
};
