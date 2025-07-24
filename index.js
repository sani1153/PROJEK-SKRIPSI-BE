// index.js
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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static untuk cover & file upload lain
app.use('/cover', express.static(path.join(__dirname, 'src/public/cover')));

// (Opsional) Logging sederhana
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use(anggotaRoutes);
app.use(peminjamanRoutes);
app.use(notifikasiRoutes); 
app.use(bukuRoute);

// Root
app.get('/', (req, res) => {
  res.send('Sistem Peminjaman Buku Berbasis IoT dengan WhatsApp API aktif.');
});

// Sync database
(async () => {
  try {
    await db.authenticate();
    console.log('Database terkoneksi.');
    await db.sync();
  } catch (error) {
    console.error('Gagal koneksi ke database:', error);
  }
})();

// Global error handler (opsional)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
