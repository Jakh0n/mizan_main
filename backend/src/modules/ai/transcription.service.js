'use strict';

const OpenAIModule = require('openai');
const env = require('../../config/env');
const { getClient } = require('./openai.client');
const logger = require('../../utils/logger');

const toFile = OpenAIModule.toFile || OpenAIModule.default?.toFile;

const transcribeBuffer = async (buffer, { filename = 'voice.ogg', language } = {}) => {
  const client = getClient();
  const file = await toFile(buffer, filename);

  const response = await client.audio.transcriptions.create({
    model: env.openai.transcribeModel,
    file,
    ...(language && { language }),
    response_format: 'json',
  });

  const text = response?.text?.trim() || '';
  logger.debug('Whisper transcription', { length: text.length });
  return text;
};

module.exports = { transcribeBuffer };
