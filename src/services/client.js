const { Client, LocalAuth } = require('whatsapp-web.js');
// const { kirimUlangQRCode } = require('../controller/AnggotaController');
const { MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Anggota = require('../models/AnggotaModels'); // sesuaikan path jika berbeda

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: 'new', // ganti dari true menjadi 'new'
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('ready', () => {
  console.log('WhatsApp client siap digunakan!');
});

client.on('authenticated', () => {
  console.log('Berhasil autentikasi dengan WhatsApp!');
});

client.on('auth_failure', (msg) => {
  console.error('Gagal autentikasi', msg);
});

client.on('disconnected', (reason) => {
  console.log('Client terputus, alasan:', reason);
});

client.on('message', async (msg) => {
  const text = msg.body.trim().toUpperCase();

  if (text === 'KIRIM ULANG KODE QR') {
    const nomorPengirim = msg.from.replace('@c.us', '');
    console.log('Nomor pengirim yang diterima:', nomorPengirim);

    try {
      const anggota = await Anggota.findOne({ where: { nomor_hp: nomorPengirim } });

      if (!anggota) {
        await msg.reply('Nomor Anda belum terdaftar sebagai anggota.');
        return;
      }

      const qrData = anggota.id_anggota;
      const qrFilePath = path.join(__dirname, `../public/qrcodes/${qrData}.png`);
      console.log('QR file path:', qrFilePath);

      // Jika file QR belum ada, buat ulang
      if (!fs.existsSync(qrFilePath)) {
        console.log('QR file tidak ditemukan, membuat QR baru...');
        await QRCode.toFile(qrFilePath, qrData);
      } else {
        console.log('QR file ditemukan, siap kirim...');
      }

      const media = MessageMedia.fromFilePath(qrFilePath);
      await client.sendMessage(msg.from, media, {
        caption: `Assalamu'alaikum wr.wb\n\nHalo ${anggota.nama}, berikut adalah Kde QR ID Anggota Perpustakaan Anda.`
      });

      console.log('QR Code berhasil dikirim.');
    } catch (err) {
      console.error('Gagal mengirim ulang QR:', err.message);
      await msg.reply('Terjadi kesalahan saat mengirim ulang kode QR.');
    }
  }
});

client.initialize();

module.exports = { client };
