const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Petugas = db.define('petugas', {
  id_Petugas: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,   
  }
}, {
  freezeTableName: true
});

module.exports = Petugas;