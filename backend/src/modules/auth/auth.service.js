"use strict";

const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");
const userRepository = require("../users/user.repository");
const workspaceRepository = require("../users/workspace.repository");
const User = require("../users/user.model");
const { ROLES } = require("../../constants/roles");

const buildTokens = (user) => {
  const payload = {
    sub: user._id.toString(),
    workspaceId: user.workspaceId.toString(),
    role: user.role,
  };
  const accessToken = jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

const register = async ({
  fullName,
  email,
  password,
  businessName,
  industry,
}) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict("Email already registered");
  }

  const workspace = await workspaceRepository.create({
    name: businessName,
    industry,
  });

  const passwordHash = await User.hashPassword(password);
  const user = await userRepository.create({
    workspaceId: workspace._id,
    fullName,
    email,
    passwordHash,
    role: ROLES.OWNER,
  });

  const tokens = buildTokens(user);
  return { user, workspace, tokens };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email, { withPassword: true });
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("Account disabled");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw ApiError.unauthorized("Invalid email or password");

  user.lastLoginAt = new Date();
  await user.save();

  const workspace = await workspaceRepository.findById(user.workspaceId);
  const tokens = buildTokens(user);
  return { user, workspace, tokens };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized("Refresh token required");

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch (_err) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("User not found");

  const tokens = buildTokens(user);
  return { tokens, user };
};

const me = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  const workspace = await workspaceRepository.findById(user.workspaceId);
  return { user, workspace };
};

module.exports = { register, login, refresh, me };
