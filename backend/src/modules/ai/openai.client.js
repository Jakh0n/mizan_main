'use strict';

const OpenAIModule = require('openai');
const env = require('../../config/env');

const OpenAI = OpenAIModule.OpenAI || OpenAIModule.default || OpenAIModule;

let client = null;

const getClient = () => {
  if (!env.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openai.apiKey });
  }
  return client;
};

module.exports = { getClient };
