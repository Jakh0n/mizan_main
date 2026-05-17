'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const userRepository = require('../modules/users/user.repository');

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
};

const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  const payload = jwt.verify(token, env.jwt.accessSecret);
  const user = await userRepository.findById(payload.sub);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is disabled');
  }

  req.user = user;
  req.workspaceId = user.workspaceId;
  next();
});

const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (allowedRoles.length === 0) return next();
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission for this action'));
  }
  return next();
};

module.exports = { authenticate, authorize };
