// server/middleware/errorHandler.js
// =========================================================
// Global Error Handling Middleware
// Catches all unhandled errors and returns clean JSON
// =========================================================

function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
