// server/controllers/orderController.js
// =========================================================
// Order Controller - Handles order placement and retrieval
// =========================================================

const Order   = require('../models/Order');
const Product = require('../models/Product');
const User    = require('../models/User');
const { sendOrderConfirmation, sendStatusUpdate } = require('../services/emailService');

/**
 * POST /api/orders
 * Place a new order (authenticated users only)
 * Body: { items: [{ product_id, quantity }], delivery_address, phone_number }
 */
async function placeOrder(req, res, next) {
  try {
    const { items, delivery_address, phone_number } = req.body;
    const user_id = req.user.id;

    // --- Validation ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (!delivery_address || !phone_number) {
      return res.status(400).json({ message: 'Delivery address and phone number are required.' });
    }

    // --- Validate each item and enrich with current price ---
    const enrichedItems = [];
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Each item needs a valid product_id and quantity.' });
      }

      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ID ${item.product_id} not found.` });
      }
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.name}". Available: ${product.stock_quantity}`
        });
      }

      enrichedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price // Always use DB price, never trust client
      });
    }

    // --- Create Order ---
    const orderId = await Order.create({
      user_id,
      items: enrichedItems,
      delivery_address,
      phone_number
    });

    const order    = await Order.getById(orderId);
const customer = await User.findById(user_id);

// Send confirmation email — wrapped in try/catch so
// a failed email never blocks the order from completing
try {
  await sendOrderConfirmation(customer, order);
} catch (emailErr) {
  console.error('Order email failed:', emailErr.message);
}

res.status(201).json({
  success: true,
  message: 'Order placed successfully! We will contact you shortly.',
  order
});
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders
 * Get current user's order history
 */
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.getByUserId(req.user.id);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 * Get a specific order (user can only see their own)
 */
async function getOrderById(req, res, next) {
  try {
    const order = await Order.getById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/admin/all
 * Admin: get all orders across all users
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.getAll();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/orders/:id/status
 * Admin: update order status
 * Body: { status: 'pending'|'confirmed'|'shipped'|'delivered'|'cancelled' }
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    await Order.updateStatus(req.params.id, status);

// Send status update email to the customer
try {
  const order    = await Order.getById(req.params.id);
  const customer = await User.findById(order.user_id);
  await sendStatusUpdate(customer, order, status);
} catch (emailErr) {
  console.error('Status email failed:', emailErr.message);
}

res.json({ success: true, message: `Order status updated to "${status}".` });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/track/:id
 * Public tracking — anyone with the order ID can track it
 */
async function trackOrder(req, res, next) {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your order number.' });
    }

    // Return only safe public info — no private customer details
    res.json({
      success: true,
      order: {
        id:               order.id,
        status:           order.status,
        total_price:      order.total_price,
        delivery_address: order.delivery_address,
        created_at:       order.created_at,
        updated_at:       order.updated_at,
        items:            order.items
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, trackOrder };