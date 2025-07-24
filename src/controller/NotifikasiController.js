// const { sendMessage } = require('../services/whatsappService');
const Peminjaman = require('../models/PeminjamanModels');
const Anggota = require('../models/AnggotaModels');

const kirimNotifikasiPengembalian = async () => {
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  const tanggalBesok = besok.toISOString().slice(0, 10);

  const daftar = await Peminjaman.findAll({
    where: {
      tanggal_kembali: tanggalBesok,
      status: 'dipinjam'
    },
    include: [Anggota]
  });

  for (let item of daftar) {
    await sendMessage(item.anggota.nomor_hp, 'Pengingat: Besok adalah batas akhir pengembalian buku Anda.');
  }
};

const kirimNotifikasiDenda = async () => {
  const sekarang = new Date().toISOString().slice(0, 10);
  const daftar = await Peminjaman.findAll({
    where: {
      tanggal_kembali: { [Op.lt]: sekarang },
      status: 'dipinjam'
    },
    include: [Anggota]
  });

  for (let item of daftar) {
    await sendMessage(item.anggota.nomor_hp, 'Anda telah melewati batas pengembalian. Denda sedang berjalan.');
  }
};

module.exports = {
  kirimNotifikasiPengembalian,
  kirimNotifikasiDenda
};
