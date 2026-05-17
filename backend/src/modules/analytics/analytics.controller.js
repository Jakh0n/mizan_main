'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const service = require('./analytics.service');

const overview = asyncHandler(async (req, res) => {
  const data = await service.overview(req.workspaceId);
  return ApiResponse.ok(res, data);
});

const trend = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 14;
  const data = await service.trend(req.workspaceId, { days });
  return ApiResponse.ok(res, data);
});

const topProducts = asyncHandler(async (req, res) => {
  const data = await service.topProducts(req.workspaceId, {
    type: req.query.type || 'out',
    days: Number(req.query.days) || 30,
    limit: Number(req.query.limit) || 5,
  });
  return ApiResponse.ok(res, data);
});

const lowStock = asyncHandler(async (req, res) => {
  const data = await service.lowStockList(req.workspaceId, {
    limit: Number(req.query.limit) || 20,
  });
  return ApiResponse.ok(res, data);
});

module.exports = { overview, trend, topProducts, lowStock };
