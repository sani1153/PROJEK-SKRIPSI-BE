// AnggotaController.js (Disesuaikan)

const Anggota = require('../models/AnggotaModels');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
// Impor 'sendMedia' dan 'isReady' dari service
const { sendMedia, isReady } = require('../services/whatsappService');
const { Op } = require('sequelize');

const daftarAnggota = async (req, res) => {
  // TAMBAHKAN PENGECEKAN KESIAPAN CLIENT DI SINI
  if (!isReady()) {
    return res.status(503).json({
      error: 'Layanan WhatsApp belum siap. Silakan coba lagi dalam beberapa saat.'
    });
  }

  try {
    const { nama, nim, nomor_hp, prodi, fakultas, alamat, password } = req.body;

    const existing = await Anggota.findOne({
      where: { [Op.or]: [{ nim }, { nomor_hp }] }
    });

    if (existing) {
      return res.status(400).json({ error: 'NIM atau Nomor HP sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const anggota = await Anggota.create({
      nama, nim, nomor_hp, prodi, fakultas, alamat, password: hashedPassword
    });

    const qrData = anggota.id_anggota;
    const qrFilePath = path.join(__dirname, `../public/qrcodes/${qrData}.png`);
    fs.mkdirSync(path.dirname(qrFilePath), { recursive: true });
    await QRCode.toFile(qrFilePath, qrData);

    anggota.QR_path = qrFilePath;
    await anggota.save();

    // Pemanggilan sendMedia sekarang aman
    await sendMedia(nomor_hp, qrFilePath, `Assalamu'alaikum wr.wb\n\nHalo ${nama}, Selamat Bergabung di Perpustakaan Universitas Hamzanwadi 🤗\n\nIni adalah Kode QR ID Anggota Perpustakaan Anda. Silakan scan Kode QR ini untuk proses peminjaman buku. Jika hilang, kirim pesan "KIRIM ULANG KODE QR"\n\nTerima kasih telah bergabung!`);

    res.status(201).json({
      message: 'Anggota berhasil didaftarkan',
      anggota: {
        id_anggota: anggota.id_anggota,
        nama: anggota.nama,
        nim: anggota.nim,
        nomor_hp: anggota.nomor_hp,
        prodi: anggota.prodi,
        fakultas: anggota.fakultas,
        alamat: anggota.alamat,
        qr_path: anggota.QR_path
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mendaftar anggota', detail: err.message });
  }
};

const kirimUlangQRCode = async (nomor) => {
  // TAMBAHKAN PENGECEKAN KESIAPAN CLIENT DI SINI JUGA
  if (!isReady()) {
    console.error('Gagal kirim ulang QR: WhatsApp client belum siap.');
    return { success: false, message: 'Layanan WhatsApp belum siap.' };
  }

  try {
    const anggota = await Anggota.findOne({ where: { nomor_hp: nomor } });

    if (!anggota) {
      return { success: false, message: 'Nomor belum terdaftar sebagai anggota' };
    }

    const qrData = anggota.id_anggota;
    const qrFilePath = path.join(__dirname, `../public/qrcodes/${qrData}.png`);

    if (!fs.existsSync(qrFilePath)) {
      fs.mkdirSync(path.dirname(qrFilePath), { recursive: true });
      await QRCode.toFile(qrFilePath, qrData);
      anggota.QR_path = qrFilePath;
      await anggota.save();
    }

    await sendMedia(anggota.nomor_hp, qrFilePath, `Assalamu'alaikum wr.wb\n\nHalo ${anggota.nama}, berikut adalah Kode QR ID Anggota Perpustakaan Anda.`);

    return { success: true };
  } catch (err) {
    console.error('Gagal mengirim ulang QR:', err);
    return { success: false, message: 'Terjadi kesalahan internal' };
  }
};

const loginAnggota = async (req, res) => {
  const { nim, password } = req.body;

  if (!nim || !password) {
    return res.status(400).json({ error: 'NIM dan Password wajib diisi' });
  }

  try {
    const anggota = await Anggota.findOne({ where: { nim } });

    if (!anggota) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, anggota.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // Jangan kirimkan password ke response
    const { id_anggota, nama, nomor_hp, prodi, fakultas, alamat, QR_path } = anggota;

    res.status(200).json({
      message: 'Login berhasil',
      anggota: {
        id_anggota,
        nama,
        nim,
        nomor_hp,
        prodi,
        fakultas,
        alamat,
        qr_path: QR_path
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal login', detail: err.message });
  }
};

module.exports = {
  daftarAnggota,
  kirimUlangQRCode,
  loginAnggota
};