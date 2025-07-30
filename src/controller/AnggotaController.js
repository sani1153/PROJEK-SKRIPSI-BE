const Anggota = require('../models/AnggotaModels');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

const editAnggota = async (req, res) => {
  // 1. Ambil ID unik anggota dari parameter URL
  const { id_anggota } = req.params; 
  
  // 2. Ambil data baru dari body request
  const { nama, nim, nomor_hp, prodi, fakultas, alamat, password } = req.body;

  try {
    // 3. PERBAIKAN: Cari anggota berdasarkan Primary Key (id) yang benar
    const anggota = await Anggota.findByPk(id_anggota);

    // Jika anggota dengan ID tersebut tidak ada, kirim error 404
    if (!anggota) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    }

    // 4. PERBAIKAN: Cek apakah NIM atau No. HP yang baru sudah digunakan oleh anggota LAIN
    // Pengecekan ini hanya berjalan jika ada input 'nim' atau 'nomor_hp'
    if (nim || nomor_hp) {
        const existing = await Anggota.findOne({
            where: {
                // Cari data yang memiliki NIM atau nomor HP yang sama dengan input
                [Op.or]: [
                    { nim: nim || null }, 
                    { nomor_hp: nomor_hp || null }
                ],
                // KECUALI untuk anggota yang sedang kita edit saat ini
                id_anggota: { [Op.ne]: id_anggota } 
            }
        });

        // Jika ditemukan data lain yang menggunakan NIM/No.HP tersebut, kirim error
        if (existing) {
            return res.status(400).json({ error: 'NIM atau Nomor HP sudah digunakan oleh anggota lain' });
        }
    }

    // 5. Logika untuk update password (sudah benar)
    // Hanya update password jika ada input password baru yang tidak kosong
    if (password && password.trim() !== '') {
      anggota.password = await bcrypt.hash(password, 10);
    }

    // 6. Update data anggota dengan nilai baru
    anggota.nama = nama;
    anggota.nim = nim;
    anggota.nomor_hp = nomor_hp;
    anggota.prodi = prodi;
    anggota.fakultas = fakultas;
    anggota.alamat = alamat;
    
    // Simpan semua perubahan ke database
    await anggota.save();

    res.json({ message: 'Data anggota berhasil diperbarui', anggota });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengedit anggota', detail: err.message });
  }
};


const hapusAnggota = async (req, res) => {
  const { id_anggota } = req.params;

  try {
    const anggota = await Anggota.findByPk(id);

    if (!anggota) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    }

    // Hapus file QR jika ada
    if (anggota.QR_path && fs.existsSync(anggota.QR_path)) {
      fs.unlinkSync(anggota.QR_path);
    }

    // Hapus data anggota
    await anggota.destroy();

    res.json({ message: 'Anggota berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus anggota', detail: err.message });
  }
};

const getSemuaAnggota = async (req, res) => {
  try {
    const anggotaList = await Anggota.findAll({
      attributes: { exclude: ['password'] }, // Hindari mengirimkan password
      order: [['nama', 'ASC']] // Optional: urutkan berdasarkan nama
    });

    res.json({ data: anggotaList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data anggota', detail: err.message });
  }
};

const getAnggotaById = async (req, res) => {
  const { id_anggota } = req.params;

  try {
    const anggota = await Anggota.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!anggota) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    }

    res.json({ data: anggota });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data anggota', detail: err.message });
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

    // Buat JWT token
    const token = jwt.sign(
      {
        id_anggota: anggota.id_anggota,
        nim: anggota.nim,
        nama: anggota.nama,
        prodi: anggota.prodi,
        fakultas: anggota.fakultas
      },
      process.env.JWT_SECRET || 'SECRETKEY', // Ganti dengan env di production
      { expiresIn: '12h' }
    );

    // Kirim response tanpa password
    const { id_anggota, nama, nomor_hp, prodi, fakultas, alamat, QR_path } = anggota;

    res.status(200).json({
      message: 'Login berhasil',
      token,
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

const ubahPasswordAnggota = async (req, res) => {
  try {
    const { id_anggota } = req.params;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: "Password lama dan baru wajib diisi." });
    }

    // Ambil data anggota
    const anggota = await Anggota.findByPk(id_anggota);
    if (!anggota) {
      return res.status(404).json({ error: "Anggota tidak ditemukan." });
    }

    // Cek password lama
    const isMatch = await bcrypt.compare(old_password, anggota.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Password lama salah." });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password di database
    anggota.password = hashedPassword;
    await anggota.save();

    res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    console.error("Gagal ubah password:", err);
    res.status(500).json({ error: "Terjadi kesalahan server.", detail: err.message });
  }
};



module.exports = {
  daftarAnggota,
  kirimUlangQRCode,
  loginAnggota,
  ubahPasswordAnggota,
  editAnggota,
  hapusAnggota,
  getSemuaAnggota,
  getAnggotaById
};