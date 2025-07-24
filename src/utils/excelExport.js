const ExcelJS = require('exceljs');

const exportToExcel = async (data, path) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan');

  worksheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Nama', key: 'nama', width: 30 },
    { header: 'Judul Buku', key: 'judul', width: 30 },
    { header: 'Tanggal Pinjam', key: 'tanggal_pinjam', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  data.forEach((item, index) => {
    worksheet.addRow({
      no: index + 1,
      nama: item.nama,
      judul: item.judul,
      tanggal_pinjam: item.tanggal_pinjam,
      status: item.status
    });
  });

  await workbook.xlsx.writeFile(path);
};

module.exports = exportToExcel;