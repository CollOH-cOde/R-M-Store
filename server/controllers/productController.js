// server/controllers/productController.js
// =========================================================
// Product Controller - Handles product CRUD operations
// =========================================================

const Product = require('../models/Product');

/**
 * GET /api/products
 * Get all active products (optionally filter by category)
 * Query: ?category=men|women|kids|accessories
 */
async function getAllProducts(req, res, next) {
  try {
    const { category } = req.query;
    const products = await Product.getAll(category || null);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
 * Body: { name, description, price, category, image_url, stock_quantity }
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, image_url, stock_quantity } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    const validCategories = ['men', 'women', 'kids', 'accessories'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({ message: `Category must be one of: ${validCategories.join(', ')}` });
    }

    const productId = await Product.create({
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      category: category.toLowerCase(),
      image_url: image_url || '/images/store.jpg',
      stock_quantity: parseInt(stock_quantity) || 0
    });

    const newProduct = await Product.findById(productId);
    res.status(201).json({ success: true, message: 'Product created!', product: newProduct });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id
 * Update a product (admin only)
 */
async function updateProduct(req, res, next) {
  try {
    const updated = await Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }
    const product = await Product.findById(req.params.id);
    res.json({ success: true, message: 'Product updated!', product });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 * Soft-delete a product (admin only)
 */
async function deleteProduct(req, res, next) {
  try {
    await Product.delete(req.params.id);
    res.json({ success: true, message: 'Product removed from store.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
