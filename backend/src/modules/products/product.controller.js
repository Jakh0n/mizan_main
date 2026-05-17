'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const productService = require('./product.service');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { items, total } = await productService.list(req.workspaceId, {
    skip,
    limit,
    search: req.query.search,
    category: req.query.category,
    lowStock: req.query.lowStock,
  });
  return ApiResponse.paginated(res, items, buildPaginationMeta({ total, page, limit }));
});

const getOne = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.workspaceId, req.params.id);
  return ApiResponse.ok(res, product);
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.workspaceId, req.body);
  return ApiResponse.created(res, product, 'Product created');
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.workspaceId, req.params.id, req.body);
  return ApiResponse.ok(res, product, 'Product updated');
});

const remove = asyncHandler(async (req, res) => {
  await productService.archive(req.workspaceId, req.params.id);
  return ApiResponse.ok(res, null, 'Product archived');
});

module.exports = { list, getOne, create, update, remove };
