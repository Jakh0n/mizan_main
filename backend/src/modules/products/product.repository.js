'use strict';

const Product = require('./product.model');

const buildFilter = (workspaceId, { search, category, lowStock } = {}) => {
  const filter = { workspaceId, isArchived: false };
  if (category) filter.category = category;
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { sku: regex }, { aliases: regex }];
  }
  if (lowStock) {
    filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
  }
  return filter;
};

const list = async (workspaceId, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 }, ...rest } = options;
  const filter = buildFilter(workspaceId, rest);
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { items, total };
};

const findById = (workspaceId, id) =>
  Product.findOne({ _id: id, workspaceId, isArchived: false });

const findByName = (workspaceId, name) =>
  Product.findOne({
    workspaceId,
    isArchived: false,
    $or: [{ name: new RegExp(`^${name}$`, 'i') }, { aliases: new RegExp(`^${name}$`, 'i') }],
  });

const findManyByNames = (workspaceId, names) => {
  if (!names || names.length === 0) return [];
  const regexes = names.map((n) => new RegExp(`^${n}$`, 'i'));
  return Product.find({
    workspaceId,
    isArchived: false,
    $or: [{ name: { $in: regexes } }, { aliases: { $in: regexes } }],
  });
};

const create = (payload) => Product.create(payload);

const update = (workspaceId, id, patch) =>
  Product.findOneAndUpdate({ _id: id, workspaceId }, patch, {
    new: true,
    runValidators: true,
  });

const incrementStock = (workspaceId, id, delta) =>
  Product.findOneAndUpdate(
    { _id: id, workspaceId },
    { $inc: { stock: delta } },
    { new: true }
  );

const archive = (workspaceId, id) =>
  Product.findOneAndUpdate(
    { _id: id, workspaceId },
    { isArchived: true },
    { new: true }
  );

const countLowStock = (workspaceId) =>
  Product.countDocuments({
    workspaceId,
    isArchived: false,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  });

module.exports = {
  list,
  findById,
  findByName,
  findManyByNames,
  create,
  update,
  incrementStock,
  archive,
  countLowStock,
};
