// server/models/Product.js
// =========================================================
// Product Model - All DB queries related to products
// =========================================================

const db = require('../config/db');

const Product = {
  // Get all products (with optional category filter)
  async getAll(category = null) {
    if (category) {
      const [rows] = await db.query(
        'SELECT * FROM products WHERE category = ? AND is_active = 1 ORDER BY created_at DESC',
        [category]
      );
      return rows;
    }
    const [rows] = await db.query(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC'
    );
    return rows;
  },

  // Get a single product by ID
  async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [id]
    );
    return rows[0] || null;
  },

  // Create a new product (admin only)
  async create({ name, description, price, category, image_url, stock_quantity = 0 }) {
    const [result] = await db.query(
      `INSERT INTO products (name, description, price, category, image_url, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, image_url, stock_quantity]
    );
    return result.insertId;
  },

  // Update a product (admin only)
  async update(id, fields) {
    const allowed = ['name', 'description', 'price', 'category', 'image_url', 'stock_quantity', 'is_active'];
    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return false;
    values.push(id);

    await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },

  // Soft-delete a product (admin only)
  async delete(id) {
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  }
};

module.exports = Product;
