const cron = require('node-cron');
const { Op } = require('sequelize');
const Peminjaman = require('../models/PeminjamanModels');

cron.schedule('* * * * *', async () => {
  console.log("⏰ Mengecek denda otomatis...");
  const today = new Date();

  const peminjamanTerlambat = await Peminjaman.findAll({
    where: {
      status: 'Dipinjam',
      tanggal_kembali: {
        [Op.lt]: today
      }
    }
  });

  peminjamanTerlambat.forEach(async (p) => {
    const bedaHari = Math.floor((today - new Date(p.tanggal_kembali)) / (1000 * 60 * 60 * 24));
    const denda = bedaHari * 2000;

    await p.update({ denda });
    console.log(`Denda diperbarui untuk ID ${p.id_anggota}: Rp ${denda}`);
  });
});
