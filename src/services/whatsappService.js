const path = require('path');
const { client } = require('./client');
const { MessageMedia } = require('whatsapp-web.js');

const sendMessage = async (number, message) => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    await client.sendMessage(formattedNumber, message);
  } catch (error) {
    console.error('Gagal mengirim pesan:', error);
  }
};

const sendMedia = async (number, filePath, caption = '') => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    const media = MessageMedia.fromFilePath(path.resolve(filePath));
    await client.sendMessage(formattedNumber, media, { caption });
  } catch (error) {
    console.error('Gagal mengirim media:', error);
  }
};

module.exports = {
  sendMessage,
  sendMedia
};
