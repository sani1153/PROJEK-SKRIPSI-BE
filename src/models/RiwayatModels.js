const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Riwayat = db.define('riwayat', {
    id_riwayat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nim: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_anggota: {
      type: DataTypes.STRING(255),
      foreignKey: true,
      allowNull: false,
    },
    id_buku: {
      type: DataTypes.STRING(255),
      foreignKey: true,
      allowNull: false,
    },
    judul_buku: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    denda: {
      type: DataTypes.INTEGER,  
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("Dipinjam", "Dikembalikan"),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  });

// WARNING! KODE DI BAWAH BERFUNGSI UNTUK MEMBUAT TABLE BARU ATAU UPDATE TABLE TAPI DENGAN MENGHAPUS SEMUA VALUE YG ADA 
db.sync({ alter: true }) // kalo mau menambahkan agar data tidak ke reset semua ganti force jadi alt: true
.then(() => {
  console.log(`Riwayat synced`)
})
.catch((error) => console.log(`Unable to connect to databse: ${error}`));

module.exports = Riwayat;
