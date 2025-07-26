const Buku = require('./BukuModels');
const Peminjaman = require('./PeminjamanModels');

// ✅ Relasi didefinisikan di sini
Buku.hasMany(Peminjaman, { foreignKey: 'id_buku' });
Peminjaman.belongsTo(Buku, { foreignKey: 'id_buku' });

module.exports = {
  Buku,
  Peminjaman
};
