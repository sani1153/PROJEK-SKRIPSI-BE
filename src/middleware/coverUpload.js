// src/middleware/coverUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const COVER_DIR = path.join(__dirname, '../public/cover');

// Pastikan folder ada
if (!fs.existsSync(COVER_DIR)) {
  fs.mkdirSync(COVER_DIR, { recursive: true });
}

// Helper slug
function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Cek dan buat nama unik jika sudah ada
function getUniqueFilename(dir, baseName, ext) {
  let finalName = `${baseName}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(dir, finalName))) {
    finalName = `${baseName}-${counter}${ext}`;
    counter++;
  }
  return finalName;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, COVER_DIR);
  },
  filename: (req, file, cb) => {
    const { judul_buku, id_buku } = req.body;
    const originalExt = path.extname(file.originalname).toLowerCase();
    const baseRaw = id_buku || judul_buku || path.basename(file.originalname, originalExt);
    const baseSlug = slugify(baseRaw) || 'cover';
    const timePart = Date.now(); // supaya minim tabrakan
    const baseName = `${baseSlug}-${timePart}`;
    const unique = getUniqueFilename(COVER_DIR, baseName, originalExt);
    cb(null, unique);
  }
});

// Filter tipe file
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Tipe file tidak diizinkan. Gunakan JPG/PNG/WebP.'));
  }
  cb(null, true);
}

const uploadCover = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}).single('cover');

// Middleware wrapper
function coverMiddleware(req, res, next) {
  uploadCover(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Upload gagal (multer)', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'Upload gagal', error: err.message });
    }

    if (req.file) {
      // Simpan path relatif untuk DB
      req.savedCoverPath = `cover/${req.file.filename}`;
    }
    next();
  });
}

module.exports = coverMiddleware;
