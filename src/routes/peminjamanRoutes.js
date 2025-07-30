const express = require('express');
const router = express.Router();
const PeminjamanController = require('../controller/PeminjamanController');
// const authenticate = require('../middleware/authenticate');

// router.use(authenticate);

router.post('/peminjaman', PeminjamanController.pinjamBuku);
router.get('/peminjaman/:id_anggota', PeminjamanController.getPeminjamanByAnggota);
router.get('/peminjaman', PeminjamanController.getAllPeminjaman);
router.put('/peminjaman/kembali/:id', PeminjamanController.kembalikanBuku);

module.exports = router;