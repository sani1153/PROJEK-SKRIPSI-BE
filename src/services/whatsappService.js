// whatsappService.js (Disesuaikan)

const path = require('path');
// Impor 'client' dan 'isReady' dari file client
const { client, isReady } = require('./client');
const { MessageMedia } = require('whatsapp-web.js');

const sendMessage = async (number, message) => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    await client.sendMessage(formattedNumber, message);
  } catch (error) {
    console.error('Gagal mengirim pesan:', error);
    // Tambahkan throw agar error bisa ditangkap di controller jika perlu
    throw error;
  }
};

const sendMedia = async (number, filePath, caption = '') => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    const media = MessageMedia.fromFilePath(path.resolve(filePath));
    await client.sendMessage(formattedNumber, media, { caption });
  } catch (error)
  {
    console.error('Gagal mengirim media:', error);
    // Tambahkan throw agar error bisa ditangkap di controller
    throw error;
  }
};

module.exports = {
  sendMessage,
  sendMedia,
  isReady // <-- Ekspor kembali fungsi isReady
};