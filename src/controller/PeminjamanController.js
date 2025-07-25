const Peminjaman = require('../models/PeminjamanModels');
const Anggota = require('../models/AnggotaModels');
const Buku = require('../models/BukuModels');
const { sendMessage } = require('../services/whatsappService');
const { Op } = require('sequelize');

const pinjamBuku = async (req, res) => {
  try {
    const { id_anggota, id_buku } = req.body;
    const tanggal_sekarang = new Date().toISOString().slice(0, 10);

    const peminjamanAktif = await Peminjaman.findAll({
      where: {
        id_anggota,
        status: 'Dipinjam' // ✅ Sesuaikan kapitalisasi
      }
    });

    const jumlahHariIni = peminjamanAktif.filter(p => p.tanggal_pinjam === tanggal_sekarang);

    if (peminjamanAktif.length >= 2) {
      return tolak(req, res, id_anggota, 'Maksimal 2 buku dapat dipinjam sekaligus');
    }

    if (
      peminjamanAktif.length === 1 &&
      peminjamanAktif[0].tanggal_pinjam !== tanggal_sekarang
    ) {
      return tolak(req, res, id_anggota, 'Buku sebelumnya belum dikembalikan dan tanggal berbeda');
    }

    const peminjaman = await Peminjaman.create({
      id_anggota,
      id_buku,
      tanggal_pinjam: tanggal_sekarang,
      tanggal_kembali: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10),
      status: 'Dipinjam' // ✅ Sesuaikan kapitalisasi
    });

    const anggota = await Anggota.findByPk(id_anggota);
    await sendMessage(anggota.nomor_hp, 'Peminjaman buku berhasil. Silakan jaga buku dengan baik.');

    res.status(201).json({ message: 'Peminjaman berhasil', peminjaman });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memproses peminjaman', detail: err.message });
  }
};

const tolak = async (req, res, id_anggota, alasan) => {
  const anggota = await Anggota.findByPk(id_anggota);
  await sendMessage(anggota.nomor_hp, `Peminjaman ditolak: ${alasan}`);
  res.status(400).json({ message: 'Peminjaman ditolak', alasan });
};

module.exports = {
  pinjamBuku
};
