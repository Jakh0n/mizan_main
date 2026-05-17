'use strict';

const axios = require('axios');
const env = require('../../config/env');

const apiBase = () => {
  if (!env.telegram.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  return `https://api.telegram.org/bot${env.telegram.botToken}`;
};

const fileBase = () => `https://api.telegram.org/file/bot${env.telegram.botToken}`;

const sendMessage = async (chatId, text, extra = {}) => {
  const { data } = await axios.post(`${apiBase()}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
  return data;
};

const getFile = async (fileId) => {
  const { data } = await axios.get(`${apiBase()}/getFile`, {
    params: { file_id: fileId },
  });
  return data?.result;
};

const downloadFile = async (filePath) => {
  const response = await axios.get(`${fileBase()}/${filePath}`, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
};

const setWebhook = async (url, secretToken) => {
  const { data } = await axios.post(`${apiBase()}/setWebhook`, {
    url,
    secret_token: secretToken,
    allowed_updates: ['message'],
  });
  return data;
};

const deleteWebhook = async () => {
  const { data } = await axios.post(`${apiBase()}/deleteWebhook`);
  return data;
};

module.exports = { sendMessage, getFile, downloadFile, setWebhook, deleteWebhook };
