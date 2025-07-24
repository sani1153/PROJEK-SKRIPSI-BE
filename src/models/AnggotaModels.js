const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Anggota = db.define('anggota', {
  id_anggota: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => {
      return 'ID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  nama: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nim: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  nomor_hp: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  prodi: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fakultas: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  QR_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  }, 
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  freezeTableName: true
});

module.exports = Anggota;