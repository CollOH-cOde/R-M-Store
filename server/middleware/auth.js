// server/middleware/auth.js
// =========================================================
// JWT Authentication Middleware
// Protects routes that require a logged-in user
// =========================================================

const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyToken
 * Checks the Authorization header for a valid JWT.
 * Attaches decoded user info to req.user if valid.
 */
function verifyToken(req, res, next) {
  // Token should come in as: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

/**
 * Middleware: requireAdmin
 * Only allows users with role = 'admin'
 * Must be used AFTER verifyToken
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
