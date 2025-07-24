const express = require('express');
const BukuController = require('../controller/BukuController');
const coverMiddleware = require('../middleware/coverUpload');
const router = express.Router();

/**
 * ROUTES BUKU
 * Base: /api/buku
 */

// Create
router.post('/buku', coverMiddleware, BukuController.addBuku);

// Read All + filter (query: ?kategori=...&bahasa=...&penulis=...)
router.get('/buku', BukuController.getBuku);

// Search by judul (query ?q=...)
router.get('/buku/search', BukuController.searchBukuByJudul);

// Get random (query ?limit=10)
router.get('/buku/random', BukuController.getRandomBuku);

// Read by ID
router.get('/buku/:id', BukuController.getBukuById);

// Update by ID
router.put('/buku/:id', coverMiddleware, BukuController.updateBuku);

// Delete by ID
router.delete('/buku/:id', BukuController.deleteBuku);

module.exports = router;
