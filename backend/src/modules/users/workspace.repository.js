'use strict';

const Workspace = require('./workspace.model');

const findById = (id) => Workspace.findById(id);
const create = (payload) => Workspace.create(payload);
const update = (id, patch) =>
  Workspace.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
const findByTelegramChatId = (chatId) =>
  Workspace.findOne({ telegramChatId: String(chatId) });

module.exports = { findById, create, update, findByTelegramChatId };
