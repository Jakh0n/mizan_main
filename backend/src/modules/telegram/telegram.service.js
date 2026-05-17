'use strict';

const telegramClient = require('./telegram.client');
const aiService = require('../ai/ai.service');
const userRepository = require('../users/user.repository');
const workspaceRepository = require('../users/workspace.repository');
const { formatProcessedResult } = require('./telegram.formatter');
const logger = require('../../utils/logger');
const env = require('../../config/env');

const WELCOME = `Welcome to your AI Inventory bot.

Send a <b>voice message</b> or text like:
"20 cola arrived today, 5 ayran sold, 2kg meat used"

I will update your inventory automatically.

To connect this chat to your account, send:
<code>/link YOUR_LINK_CODE</code>
You can find your link code in the dashboard.`;

const resolveWorkspace = async (telegramUserId, chatId) => {
  const user = await userRepository.findByTelegramUserId(telegramUserId);
  if (user) return { user, workspaceId: user.workspaceId };

  const workspace = await workspaceRepository.findByTelegramChatId(chatId);
  if (workspace) return { user: null, workspaceId: workspace._id };

  return { user: null, workspaceId: null };
};

const handleLink = async ({ chatId, telegramUserId, code }) => {
  if (!code) {
    await telegramClient.sendMessage(
      chatId,
      'Please provide a link code: /link YOUR_CODE'
    );
    return;
  }

  const workspace = await workspaceRepository.findById(code).catch(() => null);
  if (!workspace) {
    await telegramClient.sendMessage(chatId, 'Invalid link code.');
    return;
  }

  await workspaceRepository.update(workspace._id, { telegramChatId: String(chatId) });
  await userRepository
    .update(
      // attach telegram user id to first owner in workspace
      (await userRepository.listByWorkspace(workspace._id))[0]?._id,
      { telegramUserId: String(telegramUserId) }
    )
    .catch(() => null);

  await telegramClient.sendMessage(
    chatId,
    `Linked to <b>${workspace.name}</b>. You can now send voice messages.`
  );
};

const handleVoice = async ({ chatId, telegramUserId, voice }) => {
  const { user, workspaceId } = await resolveWorkspace(telegramUserId, chatId);
  if (!workspaceId) {
    await telegramClient.sendMessage(
      chatId,
      'This chat is not linked to any account. Send /start for instructions.'
    );
    return;
  }

  await telegramClient.sendMessage(chatId, 'Processing your voice message...');

  const file = await telegramClient.getFile(voice.file_id);
  if (!file?.file_path) {
    await telegramClient.sendMessage(chatId, 'Could not download voice file.');
    return;
  }

  const buffer = await telegramClient.downloadFile(file.file_path);
  const result = await aiService.processVoice({
    workspaceId,
    audioBuffer: buffer,
    filename: file.file_path.split('/').pop() || 'voice.ogg',
    createdBy: user?._id,
  });

  await telegramClient.sendMessage(chatId, formatProcessedResult(result));
};

const handleText = async ({ chatId, telegramUserId, text }) => {
  if (!text) return;
  const trimmed = text.trim();

  if (trimmed.startsWith('/start')) {
    await telegramClient.sendMessage(chatId, WELCOME);
    return;
  }
  if (trimmed.startsWith('/link')) {
    const code = trimmed.replace(/^\/link\s*/, '').trim();
    await handleLink({ chatId, telegramUserId, code });
    return;
  }
  if (trimmed.startsWith('/help')) {
    await telegramClient.sendMessage(chatId, WELCOME);
    return;
  }

  const { user, workspaceId } = await resolveWorkspace(telegramUserId, chatId);
  if (!workspaceId) {
    await telegramClient.sendMessage(
      chatId,
      'This chat is not linked. Send /start for instructions.'
    );
    return;
  }

  const result = await aiService.processTranscript({
    workspaceId,
    text: trimmed,
    createdBy: user?._id,
  });
  await telegramClient.sendMessage(chatId, formatProcessedResult(result));
};

const handleUpdate = async (update) => {
  try {
    const message = update?.message;
    if (!message) return;
    const chatId = message.chat?.id;
    const telegramUserId = message.from?.id;
    if (!chatId || !telegramUserId) return;

    if (message.voice) {
      await handleVoice({ chatId, telegramUserId, voice: message.voice });
      return;
    }
    if (message.audio) {
      await handleVoice({ chatId, telegramUserId, voice: message.audio });
      return;
    }
    if (message.text) {
      await handleText({ chatId, telegramUserId, text: message.text });
    }
  } catch (err) {
    logger.error('Telegram update handler failed', { error: err.message });
  }
};

const setupWebhook = async () => {
  if (!env.publicBaseUrl) {
    throw new Error('PUBLIC_BASE_URL must be set to register a webhook');
  }
  const url = `${env.publicBaseUrl}${env.apiPrefix}/telegram/webhook`;
  return telegramClient.setWebhook(url, env.telegram.webhookSecret);
};

module.exports = { handleUpdate, setupWebhook };
