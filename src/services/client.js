const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal'); 
const path = require('path');
const fs = require('fs');
const Anggota = require('../models/AnggotaModels');

let isClientReady = false;
let client; // ✅ simpan instance di luar biar gak dobel

function initClient() {
  if (client) {
    console.log('⚠️ Client sudah ada, tidak dibuat ulang.');
    return client;
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../../.wwebjs_auth') 
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2415.1.html'
    }
  });

  // ✅ CETAK QR CODE DI TERMINAL
  client.on('qr', (qr) => {
    console.log('📲 Scan QR Code berikut untuk login:');
    qrcodeTerminal.generate(qr, { small: true });
  });

  // STATUS CLIENT
  client.on('ready', () => {
    console.log('✅ WhatsApp client siap digunakan!');
    isClientReady = true;
  });

  client.on('authenticated', () => {
    console.log('🔐 Berhasil autentikasi dengan WhatsApp!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Gagal autentikasi:', msg);
  });

  client.on('disconnected', (reason) => {
    console.log('⚠️ Client terputus, alasan:', reason);
    isClientReady = false;

    // ✅ Reconnect otomatis
    setTimeout(() => {
      console.log('🔄 Reconnect client...');
      client.initialize();
    }, 3000);
  });

  // ✅ HANDLE PESAN MASUK
  client.on('message', async (msg) => {
    const text = msg.body.trim().toUpperCase();

    if (text === 'KIRIM ULANG KODE QR') {
      const nomorPengirim = msg.from.replace('@c.us', '');
      console.log('Nomor pengirim:', nomorPengirim);

      try {
        const anggota = await Anggota.findOne({ where: { nomor_hp: nomorPengirim } });

        if (!anggota) {
          await msg.reply('Nomor Anda belum terdaftar sebagai anggota.');
          return;
        }

        const qrData = anggota.id_anggota;
        const qrFilePath = path.join(__dirname, `../public/qrcodes/${qrData}.png`);

        if (!fs.existsSync(qrFilePath)) {
          await QRCode.toFile(qrFilePath, qrData);
        }

        const media = MessageMedia.fromFilePath(qrFilePath);
        await client.sendMessage(msg.from, media, {
          caption: `Assalamu'alaikum wr.wb\n\nHalo ${anggota.nama ?? 'Anggota'},\nIni adalah Kode QR ID Anggota Perpustakaan Anda. Silakan scan Kode QR ini untuk proses peminjaman buku. Jika hilang, kirim pesan "KIRIM ULANG KODE QR"\n\nTerima kasih!`
        });

        console.log('✅ QR Code berhasil dikirim.');
      } catch (err) {
        console.error('❌ Gagal kirim ulang QR:', err.message);
        await msg.reply('Terjadi kesalahan saat mengirim ulang kode QR.');
      }
    }
  });

  client.initialize();
  return client;
}

module.exports = {
  client: initClient(),
  isReady: () => isClientReady
};
