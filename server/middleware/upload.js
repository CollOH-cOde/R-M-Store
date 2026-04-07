// server/middleware/upload.js
// =========================================================
// Multer Upload Middleware
// Handles image file uploads and saves them to public/images/
// =========================================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Make sure the uploads folder exists
const uploadDir = path.join(__dirname, '../../public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where and how files are saved
const storage = multer.diskStorage({

  // Save files to public/images/
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  // Rename file to timestamp + original name to avoid duplicates
  // e.g. 1714000000000-nike-air.jpg
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, uniqueName);
  }

});

// Only allow image files
function fileFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // accept
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'), false); // reject
  }
}

// Final multer config — max file size 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;