'use strict';

const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ApiResponse.ok(res, result, 'Login successful');
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  return ApiResponse.ok(res, result, 'Token refreshed');
});

const me = asyncHandler(async (req, res) => {
  const result = await authService.me(req.user._id);
  return ApiResponse.ok(res, result);
});

module.exports = { register, login, refresh, me };
