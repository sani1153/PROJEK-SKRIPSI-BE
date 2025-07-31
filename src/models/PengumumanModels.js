const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Pengumuman = db.define(
  "pengumuman",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isi: {
        type: DataTypes.TEXT,
    }
  },
  {
    freezeTableName: true,
  }
);

module.exports = Pengumuman;
