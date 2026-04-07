// server/controllers/authController.js
// =========================================================
// Auth Controller - Handles signup, login, profile logic
// =========================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/auth/signup
 */
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existingUser = await User.findByEmail(email.toLowerCase());
    if (existingUser)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const userId = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase(), role: 'customer' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findByEmail(email.toLowerCase());
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/users  (admin only)
 */
async function getAllUsers(req, res, next) {
  try {
    const db = require('../config/db');
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 * FIX: accepts both `phone` (React frontend) and `phone_number` (legacy)
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone_number, phone } = req.body;
    const userId = req.user.id;
    const phoneValue = phone_number || phone || null;

    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters.' });

    const db = require('../config/db');

    // Ensure phone_number column exists (added in updated schema)
    await db.query(
      'UPDATE users SET name = ?, phone_number = ? WHERE id = ?',
      [name.trim(), phoneValue ? phoneValue.trim() : null, userId]
    );

    const updatedUser = await User.findById(userId);
    res.json({ success: true, message: 'Profile updated!', user: updatedUser });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/change-password
 * FIX: React frontend sends { currentPassword, newPassword }
 *      Legacy HTML sends  { current_password, new_password }
 *      We support BOTH.
 */
async function changePassword(req, res, next) {
  try {
    // Support both camelCase (React) and snake_case (legacy HTML)
    const currentPassword = req.body.currentPassword || req.body.current_password;
    const newPassword     = req.body.newPassword     || req.body.new_password;
    const userId          = req.user.id;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new password are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    const db     = require('../config/db');
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user   = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isValid = await User.verifyPassword(currentPassword, user.password);
    if (!isValid)
      return res.status(401).json({ message: 'Current password is incorrect.' });

    const bcrypt  = require('bcryptjs');
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, getMe, getAllUsers, updateProfile, changePassword };
