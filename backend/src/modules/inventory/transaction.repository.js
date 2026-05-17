'use strict';

const mongoose = require('mongoose');
const Transaction = require('./transaction.model');

const buildFilter = (workspaceId, { productId, type, source, from, to } = {}) => {
  const filter = { workspaceId };
  if (productId) filter.productId = productId;
  if (type) filter.type = type;
  if (source) filter.source = source;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  return filter;
};

const list = async (workspaceId, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 }, ...rest } = options;
  const filter = buildFilter(workspaceId, rest);
  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .populate('createdBy', 'fullName email')
      .populate('productId', 'name unit category')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);
  return { items, total };
};

const create = (payload) => Transaction.create(payload);
const createMany = (payloads) => Transaction.insertMany(payloads);

const summaryByType = async (workspaceId, { from, to } = {}) => {
  const match = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  return Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        totalQuantity: { $sum: '$quantity' },
        count: { $sum: 1 },
      },
    },
  ]);
};

const dailyTrend = async (workspaceId, { days = 14 } = {}) => {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  return Transaction.aggregate([
    {
      $match: {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        createdAt: { $gte: from },
      },
    },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        quantity: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.day': 1 } },
  ]);
};

const topProducts = async (workspaceId, { type = 'out', days = 30, limit = 5 } = {}) => {
  const from = new Date();
  from.setDate(from.getDate() - days);

  return Transaction.aggregate([
    {
      $match: {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        type,
        createdAt: { $gte: from },
      },
    },
    {
      $group: {
        _id: '$productId',
        productName: { $first: '$productName' },
        totalQuantity: { $sum: '$quantity' },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
  ]);
};

module.exports = {
  list,
  create,
  createMany,
  summaryByType,
  dailyTrend,
  topProducts,
};
