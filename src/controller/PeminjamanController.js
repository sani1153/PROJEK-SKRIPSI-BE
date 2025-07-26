const { Peminjaman, Buku } = require('../models/relasi');
const Anggota = require('../models/AnggotaModels');
const { sendMessage, sendMedia } = require('../services/whatsappService');
const path = require('path');
const { Op } = require('sequelize');

const pinjamBuku = async (req, res) => {
  try {
    const { id_anggota, id_buku } = req.body;
    const tanggal_sekarang = new Date();
    const tanggal_pinjam = tanggal_sekarang.toISOString().slice(0, 10);
    const tanggal_kembali_obj = new Date(tanggal_sekarang);
    tanggal_kembali_obj.setDate(tanggal_kembali_obj.getDate() + 7);
    const tanggal_kembali = tanggal_kembali_obj.toISOString().slice(0, 10);

    const peminjamanAktif = await Peminjaman.findAll({
      where: {
        id_anggota,
        status: 'Dipinjam'
      }
    });

    if (peminjamanAktif.length >= 2) {
      return tolak(req, res, id_anggota, 'Maaf, kamu sudah meminjam *2 buku*.\nMaksimal peminjaman hanya *2 buku* dalam satu waktu ya!\n\n📌 Kembalikan salah satu buku terlebih dahulu untuk meminjam lagi.\n\n_Terima kasih atas pengertiannya_\n_Tetap semangat membaca!_');
    }

    if (
      peminjamanAktif.length === 1 &&
      peminjamanAktif[0].tanggal_pinjam !== tanggal_pinjam
    ) {
      return tolak(req, res, id_anggota, '🚫 Kamu masih memiliki buku yang *belum dikembalikan* dari tanggal sebelumnya.\nPastikan buku sebelumnya sudah dikembalikan *sebelum meminjam buku baru*, ya!\n\nMenurut Peraturan Perpustakaan, Anggota hanya dapat meminjam maksimal *2 buku di hari yang sama ya*\n\n_Terima kasih atas kedisiplinanmu_\n_Mari kita jaga sirkulasi buku agar semua bisa membaca._');
    }

    const peminjaman = await Peminjaman.create({
      id_anggota,
      id_buku,
      tanggal_pinjam,
      tanggal_kembali,
      status: 'Dipinjam'
    });

    const anggota = await Anggota.findByPk(id_anggota);
    const buku = await Buku.findByPk(id_buku);

    const tanggal_pinjam_format = new Date(tanggal_pinjam).toLocaleDateString('id-ID');
    const tanggal_kembali_format = new Date(tanggal_kembali).toLocaleDateString('id-ID');

    const pesan = `✅ *Peminjaman buku berhasil!*\n\n◼ *ID Buku:* ${buku.id_buku}\n◼ *Judul:* ${buku.judul_buku}\n◼ *Pengarang:* ${buku.penulis}\n◼ *Kategori:* ${buku.kategori}\n◼ *Tanggal Pinjam:* ${tanggal_pinjam_format}\n◼ *Harap dikembalikan sebelum:* ${tanggal_kembali_format}.`;

    // Kirim media (cover buku)
    const filePath = path.join(__dirname, '../public', buku.cover); // sesuaikan folder kalau beda
    await sendMedia(anggota.nomor_hp, filePath, pesan);

    res.status(201).json({ message: 'Peminjaman berhasil', peminjaman });
  } catch (err) {
    console.error('Error peminjaman:', err);
    res.status(500).json({ error: 'Gagal memproses peminjaman', detail: err.message });
  }
};

const tolak = async (req, res, id_anggota, alasan) => {
  const anggota = await Anggota.findByPk(id_anggota);
  await sendMessage(anggota.nomor_hp, `⚠️ *Peminjaman Ditolak!*\n\n ${alasan}`);
  res.status(400).json({ message: 'Peminjaman ditolak', alasan });
};

const getPeminjamanByAnggota = async (req, res) => {
  try {
    const { id_anggota } = req.params;
    console.log('ID Anggota:', id_anggota);

    const peminjaman = await Peminjaman.findAll({
      where: { id_anggota },
      include: [
        {
          model: Buku,
          attributes: ['id_buku', 'judul_buku', 'penulis', 'kategori', 'cover']
        }
      ],
      order: [['status', 'DESC'], ['tanggal_pinjam', 'DESC']]
    });

    console.log('Jumlah peminjaman:', peminjaman.length);

    const result = peminjaman.map(p => ({
      id_buku: p.buku?.id_buku,
      judul_buku: p.buku?.judul_buku,
      penulis: p.buku?.penulis,
      kategori: p.buku?.kategori,
      cover: p.buku?.cover,
      status: p.status
    }));

    console.log(JSON.stringify(peminjaman, null, 2));

    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil data peminjaman', detail: error.message });
  }
};


module.exports = {
  pinjamBuku, 
  getPeminjamanByAnggota
};
