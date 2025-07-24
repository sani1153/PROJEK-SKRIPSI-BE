const express = require('express');
const router = express.Router();
const PeminjamanController = require('../controller/PeminjamanController');

router.post('/peminjaman', PeminjamanController.pinjamBuku);

module.exports = router;