require('dotenv').config(); // <= Tambahkan ini jika pakai .env
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/config/db');

// Import routes
const anggotaRoutes = require('./src/routes/anggotaRoutes');
const peminjamanRoutes = require('./src/routes/peminjamanRoutes');
const notifikasiRoutes = require('./src/routes/notifikasiRoutes');
const bukuRoute = require('./src/routes/BukuRoutes');

// Import middleware
const authenticate = require('./src/middleware/authenticate');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Static file
app.use('/cover', express.static(path.join(__dirname, 'src/public/cover')));
app.use('/qrcodes', express.static(path.join(__dirname, 'src/public/qrcodes')));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// === ROUTES PUBLIK ===
app.use(anggotaRoutes); // login & daftar tidak perlu token
app.use(bukuRoute);

// === ROUTES TERPROTEKSI (HARUS LOGIN) ===
app.use(authenticate); // semua route setelah ini wajib token

app.use(peminjamanRoutes);
app.use(notifikasiRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Sistem Peminjaman Buku Berbasis IoT dengan WhatsApp API aktif.');
});

// Sync database
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Database terkoneksi.');
    await db.sync();
  } catch (error) {
    console.error('❌ Gagal koneksi ke database:', error);
  }
})();

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
