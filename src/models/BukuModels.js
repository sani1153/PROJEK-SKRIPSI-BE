const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Buku = db.define('buku', {
    id_buku: {
        type: DataTypes.STRING(255),
        primaryKey: true
    },
    judul_buku: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    penulis: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    penerbit: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tahun_terbit: {
        type: DataTypes.INTEGER,   // Int(10)
        allowNull: false
    },
    eksemplar: {
        type: DataTypes.INTEGER,   // Int(100)
        allowNull: false
    },
    kategori: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    bahasa: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cover: {
        type: DataTypes.STRING(255),  // Lokasi file/URL cover
        allowNull: true
    },
    status_ketersediaan: {
        type: DataTypes.ENUM('Tersedia', 'Sedang Dipinjam'),
        defaultValue: 'Tersedia'
    },
    halaman: {
        type: DataTypes.INTEGER,   // Jumlah halaman
        allowNull: true
    },
    stok: {
        type: DataTypes.INTEGER,   // Jumlah stok buku
        allowNull: false,
        defaultValue: 0
    }
}, {
    freezeTableName: true
});

module.exports = Buku;
