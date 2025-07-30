const Buku = require('./BukuModels');
const Peminjaman = require('./PeminjamanModels');
const Anggota = require('./AnggotaModels');

// Relasi Buku ↔️ Peminjaman
Buku.hasMany(Peminjaman, { foreignKey: 'id_buku' });
Peminjaman.belongsTo(Buku, { foreignKey: 'id_buku' });

// Relasi Anggota ↔️ Peminjaman
Anggota.hasMany(Peminjaman, { foreignKey: 'id_anggota' });
Peminjaman.belongsTo(Anggota, {
  foreignKey: 'id_anggota',
  as: 'anggota', // ⬅️ Tambahkan alias di sini
});


module.exports = {
  Buku,
  Peminjaman,
  Anggota
};
