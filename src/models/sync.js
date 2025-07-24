// // models/index.js
// const db = require("../config/db");
// const Petugas = require("./PetugasModels");
// const Riwayat = require("./RiwayatModels");
// const Buku = require("./BukuModels");
// const Anggota = require("./AnggotaModels"); // Import model Anggota jika ada
// const Peminjaman = require("./PeminjamanModels"); // Import model Peminjaman jika ada
// // import model lain jika ada

// db.sync({ alter: true })
//   .then(() => console.log("All models synced"))
//   .catch((error) => console.error(`Unable to sync database: ${error}`));

// module.exports = {
//   Petugas,
//   Riwayat,
//   Buku,
//   Anggota, // export model Anggota jika ada
//   Peminjaman, // export model Peminjaman jika ada
//   // export model lain kalau ada
// };
