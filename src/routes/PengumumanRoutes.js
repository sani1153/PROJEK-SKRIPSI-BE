const express = require('express');
const router = express.Router();
const PengumumanController = require('../controller/PengumumanController');

router.get("/pengumuman", PengumumanController.getPengumuman);
router.post("/pengumuman", PengumumanController.tambahPengumuman);
router.put("/pengumuman/:id", PengumumanController.editPengumuman);

module.exports = router;