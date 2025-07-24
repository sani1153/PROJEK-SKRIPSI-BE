const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Peminjaman = db.define('peminjaman', {
    id_peminjaman: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_anggota: {
      type: DataTypes.STRING(255),
      foreignKey: true,
      allowNull: false
    },
    id_buku: {
      type: DataTypes.STRING(255),
      foreignKey: true,
      allowNull: false
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Dipinjam', 'Dikembalikan'),
      allowNull: false,
      defaultValue: 'Dipinjam'
    },
    denda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    freezeTableName: true
  });

// WARNING! KODE DI BAWAH BERFUNGSI UNTUK MEMBUAT TABLE BARU ATAU UPDATE TABLE TAPI DENGAN MENGHAPUS SEMUA VALUE YG ADA 
// db.sync({ alter: true }) // kalo mau menambahkan agar data tidak ke reset semua ganti force jadi alt: true
// .then(() => {
//   console.log(`peminjaman synced`)
// })
// .catch((error) => console.log(`Unable to connect to databse: ${error}`));
  
module.exports = Peminjaman;
