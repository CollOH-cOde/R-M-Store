// server/models/Order.js
// =========================================================
// Order Model - All DB queries related to orders
// =========================================================

const db = require('../config/db');

const Order = {
  // Create a new order and its items (uses a transaction)
  async create({ user_id, items, delivery_address, phone_number }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Calculate total price from items
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // 2. Insert the order header
      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, total_price, delivery_address, phone_number, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [user_id, total, delivery_address, phone_number]
      );
      const orderId = orderResult.insertId;

      // 3. Insert each order item
      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );

        // 4. Reduce stock quantity for each product
        await conn.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Get all orders for a specific user
  async getByUserId(user_id) {
    const [orders] = await db.query(
      `SELECT o.*, COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user_id]
    );
    return orders;
  },

  // Get a single order with full item details
  async getById(order_id, user_id = null) {
    // Build query - admin can view any order; customers see only their own
    let query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    const params = [order_id];

    if (user_id) {
      query += ' AND o.user_id = ?';
      params.push(user_id);
    }

    const [orders] = await db.query(query, params);
    if (!orders[0]) return null;

    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order_id]
    );

    return { ...orders[0], items };
  },

  // Admin: get all orders
  async getAll() {
    const [rows] = await db.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email,
              COUNT(oi.id) as item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    return rows;
  },

  // Update order status (admin)
  async updateStatus(order_id, status) {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, order_id]);
  }
};

module.exports = Order;
