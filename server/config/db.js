// server/config/db.js
// =========================================================
// MySQL Database Connection
// Supports Railway's DATABASE_URL connection string
// AND individual DB_HOST / DB_USER / DB_PASSWORD / DB_NAME vars
// =========================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
  // Railway MySQL provides a full connection URL like:
  // mysql://user:password@host:port/database
  poolConfig = {
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Required for Railway's MySQL — it uses SSL
    ssl: process.env.DB_SSL === 'false' ? false : {
      rejectUnauthorized: false,
    },
  };
} else {
  // Local development or manual Railway env vars
  poolConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'rm_collection',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

const pool = mysql.createPool(poolConfig);

// Test the connection on startup and retry gracefully
async function testConnection(retries = 5, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ MySQL connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.error(`❌ MySQL connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('❌ All MySQL connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
}

testConnection();

module.exports = pool;
