const Petugas = require('../models/PetugasModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const daftarPetugas = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan Password wajib diisi' });
    }

    // Cek apakah username sudah digunakan
    const existing = await Petugas.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    const petugas = await Petugas.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Petugas berhasil didaftarkan',
      petugas: {
        id_Petugas: petugas.id_Petugas,
        username: petugas.username
      }
    });
  } catch (err) {
    console.error('Gagal daftar petugas:', err);
    res.status(500).json({ error: 'Gagal mendaftar petugas', detail: err.message });
  }
};

// Login Petugas
const loginPetugas = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan Password wajib diisi' });
  }

  try {
    const petugas = await Petugas.findOne({ where: { username } });

    if (!petugas) {
      return res.status(404).json({ error: 'Petugas tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, petugas.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const token = jwt.sign(
      {
        id_Petugas: petugas.id_Petugas,
        username: petugas.username
      },
      process.env.JWT_SECRET || 'SECRETKEY',
      { expiresIn: '12h' }
    );

    res.status(200).json({
      message: 'Login berhasil',
      token,
      petugas: {
        id_Petugas: petugas.id_Petugas,
        username: petugas.username
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal login petugas', detail: err.message });
  }
};

// Ubah Password Petugas
const ubahPasswordPetugas = async (req, res) => {
  try {
    const { id_Petugas } = req.params;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: "Password lama dan baru wajib diisi." });
    }

    const petugas = await Petugas.findByPk(id_Petugas);
    if (!petugas) {
      return res.status(404).json({ error: "Petugas tidak ditemukan." });
    }

    const isMatch = await bcrypt.compare(old_password, petugas.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Password lama salah." });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    petugas.password = hashedPassword;
    await petugas.save();

    res.json({ message: "Password petugas berhasil diubah." });
  } catch (err) {
    res.status(500).json({ error: "Terjadi kesalahan server.", detail: err.message });
  }
};

module.exports = {
  loginPetugas,
  ubahPasswordPetugas,
  daftarPetugas
};
