"use strict";

const productRepository = require("../products/product.repository");
const productService = require("../products/product.service");
const workspaceRepository = require("../users/workspace.repository");

const SKU_MAX_LENGTH = 64;

const capitalizeName = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const uniqueAliases = (item) => {
  const values = [item.product, ...(item.aliases || [])]
    .map((v) =>
      String(v || "")
        .trim()
        .toLowerCase(),
    )
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
  unit: item.unit || "pcs",
  stock: 0,
  price: 0,
  cost: 0,
  aliases: uniqueAliases(item),
});

const slugifySku = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SKU_MAX_LENGTH);

const buildGeneratedSku = (name) => {
  const base = slugifySku(name) || "AUTO";
  const suffix = Date.now().toString(36).toUpperCase();
  return `${base}-${suffix}`.slice(0, SKU_MAX_LENGTH);
};

const isAutoCreateEnabled = async (workspaceId) => {
  const workspace = await workspaceRepository.findById(workspaceId);
  if (!workspace?.settings) return true;
  return workspace.settings.autoCreateProducts !== false;
};

const isDuplicateKeyError = (error) => error && error.code === 11000;
const isSkuDuplicateError = (error) =>
  isDuplicateKeyError(error) &&
  (error?.keyPattern?.sku === 1 ||
    String(error?.message || "").includes("workspaceId_1_sku_1"));

const getOrCreateProduct = async (workspaceId, item) => {
  const existing = await matchProduct(workspaceId, item.product);
  if (existing) return { product: existing, created: false };

  try {
    const created = await productService.create(
      workspaceId,
      buildCreatePayload(item),
    );
    return { product: created, created: true };
  } catch (error) {
    // Handle race condition when two messages try to auto-create the same product.
    if (!isDuplicateKeyError(error)) throw error;

    const fallback = await matchProduct(workspaceId, item.product);
    if (fallback) return { product: fallback, created: false };

    // Compatibility fallback for existing DBs where sparse unique compound
    // index (workspaceId + sku) still collides on missing sku.
    if (!isSkuDuplicateError(error)) throw error;

    const created = await productService.create(workspaceId, {
      ...buildCreatePayload(item),
      sku: buildGeneratedSku(item.product),
    });
    return { product: created, created: true };
  }
};

/**
 * Match parsed items to products; optionally create missing products.
 * @returns {Promise<Array<{ raw, product, created: boolean }>>}
 */
const resolveItems = async (workspaceId, parsedItems, options = {}) => {
  const autoCreate =
    options.autoCreate !== undefined
      ? options.autoCreate
      : await isAutoCreateEnabled(workspaceId);

  const results = [];
  for (const item of parsedItems) {
    let product = null;
    let created = false;
    if (autoCreate) {
      ({ product, created } = await getOrCreateProduct(workspaceId, item));
    } else {
      product = await matchProduct(workspaceId, item.product);
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
