require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const authRoutes    = require('./server/routes/authRoutes');
const productRoutes = require('./server/routes/productRoutes');
const orderRoutes   = require('./server/routes/orderRoutes');
const errorHandler  = require('./server/middleware/errorHandler');

const app  = express();
// Railway injects PORT automatically; fallback to 3001 for local dev
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────
// Allow requests from Netlify frontend and localhost for dev.
// Set ALLOWED_ORIGIN in Railway env vars to your Netlify URL.
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,          // e.g. https://your-app.netlify.app
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Assets ─────────────────────────────────────────────
// Serve uploaded product images from public/images/
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// Health-check endpoint (Railway uses this to verify the service is up)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  🧣  R & M Collection Server');
  console.log('  ─────────────────────────────────────────');
  console.log(`  🚀  Running on port  : ${PORT}`);
  console.log(`  📦  Environment      : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🗄️   Database host    : ${process.env.DB_HOST || '(DATABASE_URL)'}`);
  console.log(`  🌐  Allowed origins  : ${allowedOrigins.join(', ')}`);
  console.log('  ─────────────────────────────────────────');
  console.log('');
});
