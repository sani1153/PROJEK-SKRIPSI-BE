const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Petugas = db.define('petugas', {
  id_Petugas: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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