const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePDF = (data, path) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path));

  doc.fontSize(16).text('Laporan Peminjaman Buku', { align: 'center' });
  doc.moveDown();

  data.forEach((item, index) => {
    doc.fontSize(12).text(`${index + 1}. ${item.nama} meminjam ${item.judul} pada ${item.tanggal_pinjam}`);
  });

  doc.end();
};

module.exports = generatePDF;