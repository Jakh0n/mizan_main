'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const telegramService = require('./telegram.service');
const env = require('../../config/env');
const logger = require('../../utils/logger');

const webhook = asyncHandler(async (req, res) => {
  if (env.telegram.webhookSecret) {
    const provided = req.headers['x-telegram-bot-api-secret-token'];
    if (provided !== env.telegram.webhookSecret) {
      throw ApiError.unauthorized('Invalid webhook secret');
    }
  }
  res.status(200).json({ ok: true });
  telegramService.handleUpdate(req.body).catch((err) => {
    logger.error('Telegram webhook async error', { error: err.message });
  });
});

const registerWebhook = asyncHandler(async (_req, res) => {
  const result = await telegramService.setupWebhook();
  return ApiResponse.ok(res, result, 'Telegram webhook registered');
});

module.exports = { webhook, registerWebhook };
