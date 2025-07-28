const express = require('express');
const router = express.Router();
const AnggotaController = require('../controller/AnggotaController');

// Endpoint untuk mendaftar anggota
router.post('/daftar', AnggotaController.daftarAnggota);
router.post('/login', AnggotaController.loginAnggota);
router.put("/anggota/:id_anggota/ubah-password", AnggotaController.ubahPasswordAnggota);

// [Opsional] Endpoint manual untuk kirim ulang QR (misalnya via Postman)
router.post('/kirim-ulang', async (req, res) => {
  const { nomor_hp } = req.body;

  if (!nomor_hp) {
    return res.status(400).json({ error: 'Nomor HP diperlukan' });
  }

  const result = await AnggotaController.kirimUlangQRCode(nomor_hp);

  if (result.success) {
    res.json({ message: 'QR Code berhasil dikirim ulang' });
  } else {
    res.status(404).json({ error: result.message || 'Gagal kirim ulang QR' });
  }
});


module.exports = router;
