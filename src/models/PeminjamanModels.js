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
  
module.exports = Peminjaman;
