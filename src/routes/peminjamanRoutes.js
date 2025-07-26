const express = require('express');
const router = express.Router();
const PeminjamanController = require('../controller/PeminjamanController');
// const authenticate = require('../middleware/authenticate');

// router.use(authenticate);

router.post('/peminjaman', PeminjamanController.pinjamBuku);
router.get('/peminjaman/:id_anggota', PeminjamanController.getPeminjamanByAnggota);

module.exports = router;