// jobs/pengingatPeminjaman.js
const { Op } = require("sequelize");
const { Peminjaman } = require("../models/relasi");
const { sendMessage } = require("../services/whatsappService");

const hitungDenda = (tanggalKembali, tanggalSekarang, tarif = 2000) => {
  const kembali = new Date(tanggalKembali);
  const sekarang = new Date(tanggalSekarang);
  const selisih = Math.floor((sekarang - kembali) / (1000 * 60 * 60 * 24));
  return selisih > 0 ? selisih * tarif : 0;
};

const jalankanPengingat = async () => {
  const hariIni = new Date();
  const formatDate = (date) => date.toISOString().slice(0, 10);

  const besok = new Date(hariIni);
  besok.setDate(hariIni.getDate() + 1);

  const kemarin = new Date(hariIni);
  kemarin.setDate(hariIni.getDate() - 1);

  // Reminder: 1 hari sebelum tanggal_kembali (besok = tanggal_kembali)
  const pengingat = await Peminjaman.findAll({
    where: {
      status: "Dipinjam",
      tanggal_kembali: formatDate(besok),
    },
  });

  for (let p of pengingat) {
    await sendMessage(p.nomor_hp, `📚 *Pengingat Pengembalian Buku*\n\nHalo, ini pengingat bahwa buku *${p.judul_buku}* harus dikembalikan *besok (${p.tanggal_kembali})*.\n\nMohon dikembalikan tepat waktu agar tidak terkena denda.\n\n_Terima kasih!_`);
  }

  // Warning: 1 hari setelah jatuh tempo (kemarin = tanggal_kembali)
  const peringatan = await Peminjaman.findAll({
    where: {
      status: "Dipinjam",
      tanggal_kembali: formatDate(kemarin),
    },
  });

  for (let p of peringatan) {
    const denda = hitungDenda(p.tanggal_kembali, formatDate(hariIni));
    await sendMessage(p.nomor_hp, `⚠️ *Peringatan Keterlambatan Pengembalian*\n\nBuku *${p.judul_buku}* seharusnya dikembalikan *kemarin (${p.tanggal_kembali})*.\n\n💰 Denda saat ini: *Rp${denda.toLocaleString()}*\n\nHarap segera dikembalikan agar dendanya tidak bertambah. Terima kasih.`);
  }
};

module.exports = jalankanPengingat;
