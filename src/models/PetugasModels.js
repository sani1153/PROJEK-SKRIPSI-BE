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

// WARNING! KODE DI BAWAH BERFUNGSI UNTUK MEMBUAT TABLE BARU ATAU UPDATE TABLE TAPI DENGAN MENGHAPUS SEMUA VALUE YG ADA 
db.sync({ alter: true }) // kalo mau menambahkan agar data tidak ke reset semua ganti force jadi alt: true
.then(() => {
  console.log(`Petugas synced`)
})
.catch((error) => console.log(`Unable to connect to databse: ${error}`));

module.exports = Petugas;