-- =============================================
-- R & M Collection — MySQL Database Schema
-- =============================================
-- HOW TO RUN on Railway:
--   1. Open Railway dashboard → your MySQL service → Query tab
--   2. Paste and execute this entire file
-- =============================================

CREATE DATABASE IF NOT EXISTS railway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE railway;

-- ── USERS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)    NOT NULL,
  email        VARCHAR(150)    NOT NULL UNIQUE,
  password     VARCHAR(255)    NOT NULL,
  role         ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  phone_number VARCHAR(30)     DEFAULT NULL,
  created_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ── PRODUCTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(200)    NOT NULL,
  description     TEXT,
  price           DECIMAL(10, 2)  NOT NULL CHECK (price > 0),
  category        ENUM('men','women','kids','accessories') NOT NULL,
  image_url       VARCHAR(500)    DEFAULT '/images/store.jpg',
  stock_quantity  INT UNSIGNED    NOT NULL DEFAULT 0,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active   (is_active)
);

-- ── ORDERS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED    NOT NULL,
  total_price      DECIMAL(10, 2)  NOT NULL,
  delivery_address TEXT            NOT NULL,
  phone_number     VARCHAR(25)     NOT NULL,
  status           ENUM('pending','confirmed','shipped','delivered','cancelled')
                   NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status  (status)
);

-- ── ORDER ITEMS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED    NOT NULL,
  product_id  INT UNSIGNED    NOT NULL,
  quantity    INT UNSIGNED    NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10, 2)  NOT NULL,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id)
);

-- ── SEED: SAMPLE PRODUCTS ─────────────────────────────────────
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
  ('Air Jordan XI',
   'Classic high-top basketball sneakers with iconic style and comfort.',
   4000.00, 'kids', '/images/kids.jpg', 15),
  ('Converse All-Star',
   'Timeless canvas sneaker available in multiple colorways — a wardrobe staple.',
   1500.00, 'accessories', '/images/rb.jpg', 25),
  ('Adidas Samba',
   'Retro indoor-style shoe with suede upper and signature gum sole.',
   3500.00, 'men', '/images/samba.jpg', 10),
  ('Men''s Casual Set',
   'A smart-casual outfit that works for every occasion — versatile and stylish.',
   2500.00, 'men', '/images/men.jpg', 8),
  ('Women''s Elegance',
   'Chic, confident, and effortlessly elegant — curated for the modern woman.',
   3200.00, 'women', '/images/women.jpg', 12),
  ('Kids Fun Pack',
   'Fun, playful, and made for comfort — perfect for active little ones.',
   1800.00, 'kids', '/images/baby.jpg', 20),
  ('Women''s Summer Look',
   'Bright, fresh summer styles that keep you cool and fashionable.',
   2800.00, 'women', '/images/meny.jpg', 18),
  ('Classic Accessories Bundle',
   'Complete your look with a curated accessories set.',
   1200.00, 'accessories', '/images/acc.jpg', 30);

-- ── SEED: ADMIN USER ──────────────────────────────────────────
-- Default password: Admin@12345  (change this after first login!)
-- Hash generated with bcrypt (12 salt rounds)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin',
   'admin@rmcollection.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PteG2e',
   'admin');

SELECT 'Schema created successfully!' AS message;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_users    FROM users;
