"use strict";

const User = require("./user.model");

const findById = (id) => User.findById(id);

const findByEmail = (email, { withPassword = false } = {}) => {
  const query = User.findOne({ email: email.toLowerCase() });
  if (withPassword) query.select("+passwordHash");
  return query;
};

const findByTelegramUserId = (telegramUserId) =>
  User.findOne({ telegramUserId: String(telegramUserId) });

const create = (payload) => User.create(payload);

const update = (id, patch) =>
  User.findByIdAndUpdate(id, patch, { new: true, runValidators: true });

const listByWorkspace = (workspaceId) =>
  User.find({ workspaceId }).sort({ createdAt: -1 });

module.exports = {
  findById,
  findByEmail,
  findByTelegramUserId,
  create,
  update,
  listByWorkspace,
};
