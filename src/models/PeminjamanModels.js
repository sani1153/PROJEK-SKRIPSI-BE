const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Peminjaman = db.define(
  "peminjaman",
  {
    id_peminjaman: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_anggota: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_buku: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nomor_hp: {
      type: DataTypes.STRING(255),
    },
    nim: {
      type: DataTypes.STRING(255),
    },
    judul_buku: {
      type: DataTypes.STRING(255),
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tanggal_pengembalian: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Dipinjam", "Dikembalikan"),
      allowNull: false,
      defaultValue: "Dipinjam",
    },
    denda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,

    // Tambahkan hooks di sini
    hooks: {
      beforeUpdate: (peminjaman, options) => {
        if (
          peminjaman.changed("tanggal_pengembalian") &&
          peminjaman.tanggal_kembali &&
          peminjaman.tanggal_pengembalian
        ) {
          const kembali = new Date(peminjaman.tanggal_kembali);
          const dikembalikan = new Date(peminjaman.tanggal_pengembalian);

          const selisihHari = Math.floor(
            (dikembalikan - kembali) / (1000 * 60 * 60 * 24)
          );

          const denda = selisihHari > 0 ? selisihHari * 2000 : 0;
          peminjaman.denda = denda;
        }
      },
    },
  }
);

module.exports = Peminjaman;
