// server/routes/productRoutes.js
// =========================================================
// Product Routes
// =========================================================

const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET  /api/products          - Public: list all products (with optional ?category= filter)
router.get('/',     getAllProducts);

// GET  /api/products/:id      - Public: get single product
router.get('/:id',  getProductById);

// POST /api/products          - Admin only: create product
router.post('/',    verifyToken, requireAdmin, createProduct);

// PUT  /api/products/:id      - Admin only: update product
router.put('/:id',  verifyToken, requireAdmin, updateProduct);

// DELETE /api/products/:id   - Admin only: soft-delete product
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

// POST /api/products/upload-image  - Admin only: upload a product image
// Returns the image URL to use when creating/editing a product
router.post(
  '/upload-image',
  verifyToken,
  requireAdmin,
  upload.single('image'),   // 'image' must match the form field name
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file received.' });
    }
    // Return the public URL path of the uploaded image
    const imageUrl = `/images/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  }
);

module.exports = router;
