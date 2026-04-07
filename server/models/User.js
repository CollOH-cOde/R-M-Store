// server/models/User.js
// =========================================================
// User Model - All DB queries related to users
// =========================================================

const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Find a user by their email address
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  // Find a user by their ID (safe version - no password)
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Create a new user (hashes password automatically)
  async create({ name, email, password, role = 'customer' }) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  },

  // Verify a plain password against the stored hash
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;
