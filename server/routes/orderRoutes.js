const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrder
} = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/orders             - Logged-in user: place a new order
router.post('/',              verifyToken, placeOrder);

// GET  /api/orders             - Logged-in user: get own order history
router.get('/',               verifyToken, getMyOrders);

// GET  /api/orders/admin/all  - Admin: get ALL orders across all users
router.get('/admin/all',      verifyToken, requireAdmin, getAllOrders);

// GET /api/orders/track/:id  - Public order tracking (no login needed)
router.get('/track/:id',      trackOrder);

// GET  /api/orders/:id        - Logged-in user: get specific order details
router.get('/:id',            verifyToken, getOrderById);

// PATCH /api/orders/:id/status - Admin: update an order's status
router.patch('/:id/status',   verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
