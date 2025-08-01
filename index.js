require('dotenv').config(); // <= Tambahkan ini jika pakai .env
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/config/db');
const cron = require("node-cron");
const pengingatPeminjaman = require("./src/jobs/pengingatPeminjaman");
require('./src/jobs/dendaChecker'); // Import denda checker


// Jalankan setiap hari jam 07:00 pagi
cron.schedule("0 7 * * *", async () => {
  console.log("⏰ Menjalankan pengingat otomatis peminjaman...");
  await pengingatPeminjaman();
});

// Import routes
const anggotaRoutes = require('./src/routes/anggotaRoutes');
const peminjamanRoutes = require('./src/routes/peminjamanRoutes');
const notifikasiRoutes = require('./src/routes/notifikasiRoutes');
const bukuRoute = require('./src/routes/BukuRoutes');
const petugasRoutes = require('./src/routes/petugasRoutes');
const getAllRoutes = require('./src/routes/getAllRoutes');
const pengumumanRoutes = require('./src/routes/PengumumanRoutes'); // Import pengumuman routes


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
app.use(peminjamanRoutes);
app.use(notifikasiRoutes);
app.use(petugasRoutes);
app.use(getAllRoutes);
app.use(pengumumanRoutes); // Tambahkan rute pengumuman

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
