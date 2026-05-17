'use strict';

const ApiError = require('../../utils/ApiError');
const productRepository = require('./product.repository');

const list = async (workspaceId, query) => {
  return productRepository.list(workspaceId, query);
};

const getById = async (workspaceId, id) => {
  const product = await productRepository.findById(workspaceId, id);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const create = async (workspaceId, payload) => {
  return productRepository.create({ ...payload, workspaceId });
};

const update = async (workspaceId, id, patch) => {
  const product = await productRepository.update(workspaceId, id, patch);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const archive = async (workspaceId, id) => {
  const product = await productRepository.archive(workspaceId, id);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const lowStockCount = (workspaceId) => productRepository.countLowStock(workspaceId);

module.exports = { list, getById, create, update, archive, lowStockCount };
