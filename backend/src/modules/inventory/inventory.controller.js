'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const inventoryService = require('./inventory.service');
const { TRANSACTION_SOURCES } = require('../../constants/inventory');

const create = asyncHandler(async (req, res) => {
  const result = await inventoryService.recordTransaction({
    workspaceId: req.workspaceId,
    productId: req.body.productId,
    type: req.body.type,
    quantity: req.body.quantity,
    note: req.body.note,
    source: TRANSACTION_SOURCES.MANUAL,
    createdBy: req.user._id,
  });
  return ApiResponse.created(res, result, 'Transaction recorded');
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { items, total } = await inventoryService.listTransactions(req.workspaceId, {
    skip,
    limit,
    productId: req.query.productId,
    type: req.query.type,
    source: req.query.source,
    from: req.query.from,
    to: req.query.to,
  });
  return ApiResponse.paginated(res, items, buildPaginationMeta({ total, page, limit }));
});

module.exports = { create, list };
