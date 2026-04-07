require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./server/config/db');

async function createAdmin() {
  const password = '4496Collo';
  const hash = await bcrypt.hash(password, 12);
  console.log('Generated hash:', hash);
  await db.query("DELETE FROM users WHERE email = 'kinuthiakipkoech@gmail.com'");
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ['Admin', 'kinuthiakipkoech@gmail.com', hash, 'admin']
  );
  console.log('✅ Admin created successfully!');
  console.log('Email:    kinuthiakipkoech@gmail.com');
  console.log('Password: 4496Collo');
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
