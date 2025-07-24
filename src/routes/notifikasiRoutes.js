const express = require('express');
const router = express.Router();
const NotifikasiController = require('../controller/NotifikasiController');

router.get('/notifikasi/peringatan', NotifikasiController.kirimNotifikasiPengembalian);
router.get('/notifikasi/denda', NotifikasiController.kirimNotifikasiDenda);

module.exports = router;