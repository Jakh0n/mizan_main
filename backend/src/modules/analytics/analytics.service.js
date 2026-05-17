'use strict';

const mongoose = require('mongoose');
const Product = require('../products/product.model');
const productRepository = require('../products/product.repository');
const transactionRepository = require('../inventory/transaction.repository');

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);

const overview = async (workspaceId) => {
  const wid = toObjectId(workspaceId);
  const [productAgg, lowStock, summary30d] = await Promise.all([
    Product.aggregate([
      { $match: { workspaceId: wid, isArchived: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: '$stock' },
          totalCostValue: { $sum: { $multiply: ['$stock', '$cost'] } },
          totalRetailValue: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
    ]),
    productRepository.countLowStock(workspaceId),
    transactionRepository.summaryByType(workspaceId, {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }),
  ]);

  const productStats = productAgg[0] || {
    totalProducts: 0,
    totalUnits: 0,
    totalCostValue: 0,
    totalRetailValue: 0,
  };

  const movement = { in: 0, out: 0, adjust: 0 };
  summary30d.forEach((s) => {
    movement[s._id] = s.totalQuantity;
  });

  return {
    totalProducts: productStats.totalProducts,
    totalUnits: productStats.totalUnits,
    inventoryValueCost: productStats.totalCostValue,
    inventoryValueRetail: productStats.totalRetailValue,
    lowStockCount: lowStock,
    last30Days: movement,
  };
};

const trend = (workspaceId, { days } = {}) =>
  transactionRepository.dailyTrend(workspaceId, { days });

const topProducts = (workspaceId, { type, days, limit } = {}) =>
  transactionRepository.topProducts(workspaceId, { type, days, limit });

const lowStockList = async (workspaceId, { limit = 20 } = {}) => {
  return Product.find({
    workspaceId,
    isArchived: false,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  })
    .sort({ stock: 1 })
    .limit(limit);
};

module.exports = { overview, trend, topProducts, lowStockList };
