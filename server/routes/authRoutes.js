// server/routes/authRoutes.js
// =========================================================
// Auth Routes
// =========================================================

const express = require('express');
const router = express.Router();
const { signup, login, getMe, getAllUsers, updateProfile, changePassword } = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/auth/signup  - Register new user
router.post('/signup', signup);

// POST /api/auth/login   - Login user
router.post('/login', login);

// GET  /api/auth/me      - Get current user profile (protected)
router.get('/me', verifyToken, getMe);

// GET  /api/auth/users   - Admin: list all users
// GET  /api/auth/users         - Admin: list all users
router.get('/users', verifyToken, requireAdmin, getAllUsers);

// PUT  /api/auth/profile        - Update profile details
router.put('/profile', verifyToken, updateProfile);

// PUT  /api/auth/change-password - Change password
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
