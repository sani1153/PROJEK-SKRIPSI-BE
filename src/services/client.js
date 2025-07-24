// client.js (Disesuaikan)

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Anggota = require('../models/AnggotaModels');

// Variabel untuk melacak status client
let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

client.on('ready', () => {
  console.log('WhatsApp client siap digunakan!');
  isClientReady = true; // <-- Status diubah menjadi siap
});

client.on('authenticated', () => {
  console.log('Berhasil autentikasi dengan WhatsApp!');
});

client.on('auth_failure', (msg) => {
  console.error('Gagal autentikasi', msg);
});

client.on('disconnected', (reason) => {
  console.log('Client terputus, alasan:', reason);
  isClientReady = false; // <-- Set kembali status jika terputus
});

// Logika untuk pesan masuk sudah benar dan tidak perlu diubah
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

      if (!fs.existsSync(qrFilePath)) {
        console.log('QR file tidak ditemukan, membuat QR baru...');
        await QRCode.toFile(qrFilePath, qrData);
      } else {
        console.log('QR file ditemukan, siap kirim...');
      }

      const media = MessageMedia.fromFilePath(qrFilePath);
      await client.sendMessage(msg.from, media, {
        caption: `Assalamu'alaikum wr.wb\n\nHalo ${anggota.nama}, berikut adalah Kode QR ID Anggota Perpustakaan Anda.`
      });

      console.log('QR Code berhasil dikirim.');
    } catch (err) {
      console.error('Gagal mengirim ulang QR:', err.message);
      await msg.reply('Terjadi kesalahan saat mengirim ulang kode QR.');
    }
  }
});

client.initialize();

// Ekspor client dan fungsi untuk memeriksa status
module.exports = {
  client,
  isReady: () => isClientReady
};