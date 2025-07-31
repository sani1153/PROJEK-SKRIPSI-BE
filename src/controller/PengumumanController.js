const Pengumuman = require("../models/PengumumanModels");

// ====================== PENGUMUMAN ======================

// GET: Ambil semua pengumuman (tambahan agar bisa dipakai frontend)
const getPengumuman = async (req, res) => {
  try {
    const pengumuman = await Pengumuman.findAll({ order: [["updatedAt", "DESC"]] });
    res.status(200).json(pengumuman);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil pengumuman", error });
  }
};

// POST: Tambah pengumuman baru
const tambahPengumuman = async (req, res) => {
  try {
    const { isi } = req.body;
    const pengumumanBaru = await Pengumuman.create({ isi });
    res.status(201).json(pengumumanBaru);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah pengumuman", error });
  }
};

// PUT: Edit pengumuman berdasarkan ID
const editPengumuman = async (req, res) => {
  try {
    const { id } = req.params;
    const { isi } = req.body;

    const pengumuman = await Pengumuman.findByPk(id);
    if (!pengumuman) return res.status(404).json({ message: "Pengumuman tidak ditemukan" });

    pengumuman.isi = isi;
    await pengumuman.save();

    res.status(200).json(pengumuman);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengedit pengumuman", error });
  }
};


module.exports = {
  getPengumuman,
  tambahPengumuman,
  editPengumuman
};
