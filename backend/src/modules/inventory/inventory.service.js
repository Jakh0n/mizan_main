'use strict';

const ApiError = require('../../utils/ApiError');
const productRepository = require('../products/product.repository');
const transactionRepository = require('./transaction.repository');
const logger = require('../../utils/logger');
const {
  TRANSACTION_TYPES,
  TRANSACTION_SOURCES,
} = require('../../constants/inventory');

const applyDelta = (type, quantity) => {
  switch (type) {
    case TRANSACTION_TYPES.IN:
      return quantity;
    case TRANSACTION_TYPES.OUT:
      return -quantity;
    case TRANSACTION_TYPES.ADJUST:
      return quantity;
    default:
      return 0;
  }
};

const recordTransaction = async ({
  workspaceId,
  productId,
  type,
  quantity,
  source = TRANSACTION_SOURCES.MANUAL,
  note,
  rawMessage,
  createdBy,
  metadata = {},
}) => {
  if (quantity <= 0) {
    throw ApiError.badRequest('Quantity must be greater than 0');
  }

  const product = await productRepository.findById(workspaceId, productId);
  if (!product) throw ApiError.notFound('Product not found');

  const delta = applyDelta(type, quantity);
  const newStock = Math.max(0, product.stock + delta);

  if (type === TRANSACTION_TYPES.OUT && product.stock < quantity) {
    logger.warn('Stock insufficient, clamping to 0', {
      productId: product._id.toString(),
      requested: quantity,
      available: product.stock,
    });
  }

  const updatedProduct = await productRepository.update(workspaceId, product._id, {
    stock: newStock,
  });

  const transaction = await transactionRepository.create({
    workspaceId,
    productId: product._id,
    productName: product.name,
    type,
    quantity,
    unit: product.unit,
    previousStock: product.stock,
    newStock,
    source,
    note,
    rawMessage,
    createdBy,
    metadata,
  });

  return { transaction, product: updatedProduct };
};

const recordBatch = async ({ workspaceId, items, source, createdBy, rawMessage }) => {
  const results = [];
  for (const item of items) {
    try {
      const result = await recordTransaction({
        workspaceId,
        productId: item.productId,
        type: item.type,
        quantity: item.quantity,
        note: item.note,
        rawMessage,
        source,
        createdBy,
        metadata: item.metadata,
      });
      results.push({ status: 'ok', ...result });
    } catch (err) {
      results.push({ status: 'error', error: err.message, item });
    }
  }
  return results;
};

const listTransactions = async (workspaceId, query) =>
  transactionRepository.list(workspaceId, query);

module.exports = { recordTransaction, recordBatch, listTransactions };
