const express = require('express');
const router = express.Router();
const PetugasController = require('../controller/PetugasController');

// Endpoint untuk mendaftar anggota
router.post('/login-petugas', PetugasController.loginPetugas);
router.put("/petugas/:id_Petugas/ubah-password", PetugasController.ubahPasswordPetugas);
router.post('/daftar-petugas', PetugasController.daftarPetugas);

module.exports = router;
