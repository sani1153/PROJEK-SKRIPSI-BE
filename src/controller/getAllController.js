// controllers/DashboardController.js
const Anggota = require('../models/AnggotaModels');
const Buku = require('../models/BukuModels');
const Peminjaman = require('../models/PeminjamanModels');

const getAllData = async (req, res) => {
  try {
    const totalAnggota = await Anggota.count();
    const totalBuku = await Buku.count();
    const peminjaman = await Peminjaman.findAll();

    let totalDendaBelumDibayar = 0;
    let totalSedangDipinjam = 0;
    let peminjamanPerBulan = Array(12).fill(0); // Jan–Des

    peminjaman.forEach(p => {
      if (p.status === 'Dipinjam') {
        totalSedangDipinjam++;
        totalDendaBelumDibayar += p.denda || 0;
      }

      if (p.tanggal_pinjam) {
        const bulan = new Date(p.tanggal_pinjam).getMonth(); // 0-11
        peminjamanPerBulan[bulan]++;
      }
    });

    res.status(200).json({
      totalAnggota,
      totalBuku,
      totalSedangDipinjam,
      totalDendaBelumDibayar,
      peminjamanPerBulan // ⬅️ ini akan dipakai untuk chart di frontend
    });
  } catch (err) {
    console.error('Gagal mengambil data dashboard:', err);
    res.status(500).json({ error: 'Gagal mengambil data', detail: err.message });
  }
};


module.exports = { getAllData };
