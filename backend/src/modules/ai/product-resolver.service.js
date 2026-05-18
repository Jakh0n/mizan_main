'use strict';

const productRepository = require('../products/product.repository');
const productService = require('../products/product.service');
const workspaceRepository = require('../users/workspace.repository');

const capitalizeName = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const uniqueAliases = (item) => {
  const values = [item.product, ...(item.aliases || [])]
    .map((v) => String(v || '').trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(values)];
};

const matchProduct = async (workspaceId, name) => {
  if (!name) return null;

  const exact = await productRepository.findByName(workspaceId, name);
  if (exact) return exact;

  const { items } = await productRepository.list(workspaceId, {
    skip: 0,
    limit: 1,
    search: name,
  });
  return items[0] || null;
};

const buildCreatePayload = (item) => ({
  name: capitalizeName(item.product),
  unit: item.unit || 'pcs',
  stock: 0,
  price: 0,
  cost: 0,
  aliases: uniqueAliases(item),
});

const isAutoCreateEnabled = async (workspaceId) => {
  const workspace = await workspaceRepository.findById(workspaceId);
  if (!workspace?.settings) return true;
  return workspace.settings.autoCreateProducts !== false;
};

/**
 * Match parsed items to products; optionally create missing products.
 * @returns {Promise<Array<{ raw, product, created: boolean }>>}
 */
const resolveItems = async (workspaceId, parsedItems, options = {}) => {
  const autoCreate =
    options.autoCreate !== undefined ? options.autoCreate : await isAutoCreateEnabled(workspaceId);

  const results = [];
  for (const item of parsedItems) {
    let product = await matchProduct(workspaceId, item.product);
    let created = false;

    if (!product && autoCreate) {
      product = await productService.create(workspaceId, buildCreatePayload(item));
      created = true;
    }

    results.push({ raw: item, product, created });
  }
  return results;
};

module.exports = {
  matchProduct,
  resolveItems,
  isAutoCreateEnabled,
  capitalizeName,
};
