const { Peminjaman, Buku, Anggota } = require('../models/relasi');
const { sendMessage, sendMedia } = require("../services/whatsappService");
const path = require("path");
const { Op } = require("sequelize");

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
        status: "Dipinjam",
      },
    });

    if (peminjamanAktif.length >= 2) {
      return tolak(
        req,
        res,
        id_anggota,
        "Maaf, kamu sudah meminjam *2 buku*.\nMaksimal peminjaman hanya *2 buku* dalam satu waktu ya!\n\n📌 Kembalikan salah satu buku terlebih dahulu untuk meminjam lagi.\n\n_Terima kasih atas pengertiannya_\n_Tetap semangat membaca!_"
      );
    }

    if (
      peminjamanAktif.length === 1 &&
      peminjamanAktif[0].tanggal_pinjam !== tanggal_pinjam
    ) {
      return tolak(
        req,
        res,
        id_anggota,
        "🚫 Kamu masih memiliki buku yang *belum dikembalikan* dari tanggal sebelumnya.\nPastikan buku sebelumnya sudah dikembalikan *sebelum meminjam buku baru*, ya!\n\nMenurut Peraturan Perpustakaan, Anggota hanya dapat meminjam maksimal *2 buku di hari yang sama ya*\n\n_Terima kasih atas kedisiplinanmu_\n_Mari kita jaga sirkulasi buku agar semua bisa membaca._"
      );
    }

    const buku = await Buku.findByPk(id_buku);
    const anggota = await Anggota.findByPk(id_anggota);

    if (!buku || !anggota) {
      return res.status(404).json({ error: "Data buku atau anggota tidak ditemukan" });
    }

    if (buku.stok <= 0) {
      return res.status(400).json({ error: "Stok buku habis. Tidak dapat dipinjam." });
    }

    const peminjaman = await Peminjaman.create({
      id_anggota,
      id_buku,
      nomor_hp: anggota.nomor_hp,
      nim: anggota.nim,
      judul_buku: buku.judul_buku,
      tanggal_pinjam,
      tanggal_kembali,
      status: "Dipinjam",
    });

    // Kurangi stok buku
    await buku.update({ stok: buku.stok - 1 });

    const tanggal_pinjam_format = new Date(tanggal_pinjam).toLocaleDateString("id-ID");
    const tanggal_kembali_format = new Date(tanggal_kembali).toLocaleDateString("id-ID");

    const pesan = `✅ *Peminjaman buku berhasil!*\n\n◼ *ID Buku:* ${buku.id_buku}\n◼ *Judul:* ${buku.judul_buku}\n◼ *Pengarang:* ${buku.penulis}\n◼ *Kategori:* ${buku.kategori}\n◼ *Tanggal Pinjam:* ${tanggal_pinjam_format}\n◼ *Harap dikembalikan sebelum:* ${tanggal_kembali_format}.`;

    const filePath = path.join(__dirname, "../public", buku.cover);
    await sendMedia(anggota.nomor_hp, filePath, pesan);

    res.status(201).json({ message: "Peminjaman berhasil", peminjaman });
  } catch (err) {
    console.error("Error peminjaman:", err);
    res.status(500).json({ error: "Gagal memproses peminjaman", detail: err.message });
  }
};


const tolak = async (req, res, id_anggota, alasan) => {
  const anggota = await Anggota.findByPk(id_anggota);
  await sendMessage(anggota.nomor_hp, `⚠️ *Peminjaman Ditolak!*\n\n ${alasan}`);
  res.status(400).json({ message: "Peminjaman ditolak", alasan });
};

const getPeminjamanByAnggota = async (req, res) => {
  try {
    const { id_anggota } = req.params;
    console.log("ID Anggota:", id_anggota);

    const peminjaman = await Peminjaman.findAll({
      where: { id_anggota },
      include: [
        {
          model: Buku,
          attributes: ["id_buku", "judul_buku", "penulis", "kategori", "cover"],
        },
      ],
      order: [
        ["status", "DESC"],
        ["tanggal_pinjam", "DESC"],
      ],
    });

    console.log("Jumlah peminjaman:", peminjaman.length);

    const result = peminjaman.map((p) => ({
      id_buku: p.buku?.id_buku,
      judul_buku: p.buku?.judul_buku,
      penulis: p.buku?.penulis,
      kategori: p.buku?.kategori,
      cover: p.buku?.cover,
      status: p.status,
      denda: p.denda,
      tanggal_pinjam: p.tanggal_pinjam,
      tanggal_kembali: p.tanggal_kembali,
      tanggal_pengembalian: p.tanggal_pengembalian, // ✅ Ditambahkan
    }));

    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error: "Gagal mengambil data peminjaman",
      detail: error.message,
    });
  }
};

const getAllPeminjaman = async (req, res) => {
  try {
    const peminjamanList = await Peminjaman.findAll({
  include: [
    {
      model: Buku,
      attributes: ['id_buku', 'judul_buku', 'penulis', 'kategori', 'cover']
    },
    {
      model: Anggota,
      as: 'anggota', // ⬅️ Samakan dengan alias di atas
      attributes: ['id_anggota', 'nomor_hp', 'nama', 'nim', 'prodi', 'fakultas']
    }
  ],
  order: [['tanggal_pinjam', 'DESC']]
});


    res.status(200).json({ data: peminjamanList });
  } catch (error) {
    console.error('Gagal mengambil data peminjaman:', error);
    res.status(500).json({
      error: 'Gagal mengambil data peminjaman',
      detail: error.message
    });
  }
};

function hitungDenda(tanggalKembali, tanggalPengembalian, tarifPerHari = 2000) {
  const kembali = new Date(tanggalKembali);
  const pengembalian = new Date(tanggalPengembalian);

  const selisihHari = Math.floor((pengembalian - kembali) / (1000 * 60 * 60 * 24));
  return selisihHari > 0 ? selisihHari * tarifPerHari : 0;
}

const kembalikanBuku = async (req, res) => {
  try {
    const { id } = req.params;
    const tanggalPengembalian = new Date().toISOString().slice(0, 10);

    const peminjaman = await Peminjaman.findByPk(id);
    if (!peminjaman) {
      return res.status(404).json({ error: "Data peminjaman tidak ditemukan" });
    }

    if (peminjaman.status === "Dikembalikan") {
      return res.status(400).json({ error: "Buku sudah dikembalikan sebelumnya" });
    }

    const denda = hitungDenda(peminjaman.tanggal_kembali, tanggalPengembalian);

    await peminjaman.update({
      status: "Dikembalikan",
      tanggal_pengembalian: tanggalPengembalian,
      denda: denda
    });

    // Tambahkan stok buku
    const buku = await Buku.findByPk(peminjaman.id_buku);
    if (buku) {
      await buku.update({ stok: buku.stok + 1 });
    }

    res.status(200).json({ message: "Buku berhasil dikembalikan", peminjaman });
  } catch (err) {
    console.error("Gagal mengembalikan buku:", err);
    res.status(500).json({ error: "Gagal mengembalikan buku", detail: err.message });
  }
};


module.exports = {
  pinjamBuku,
  getPeminjamanByAnggota,
  getAllPeminjaman,
  kembalikanBuku,
};
