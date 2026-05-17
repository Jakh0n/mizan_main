'use strict';

const transcriptionService = require('./transcription.service');
const parserService = require('./parser.service');
const productRepository = require('../products/product.repository');
const inventoryService = require('../inventory/inventory.service');
const logger = require('../../utils/logger');
const { TRANSACTION_SOURCES } = require('../../constants/inventory');

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

const buildLineItems = async (workspaceId, parsedItems) => {
  const results = [];
  for (const item of parsedItems) {
    const product = await matchProduct(workspaceId, item.product);
    results.push({
      raw: item,
      product,
      matched: Boolean(product),
    });
  }
  return results;
};

const processTranscript = async ({
  workspaceId,
  text,
  source = TRANSACTION_SOURCES.AI_VOICE,
  createdBy,
}) => {
  const parsed = await parserService.parseInventoryMessage(text);
  const matched = await buildLineItems(workspaceId, parsed.items);

  const recordable = matched
    .filter((m) => m.matched)
    .map((m) => ({
      productId: m.product._id,
      type: m.raw.type,
      quantity: m.raw.quantity,
      note: m.raw.note,
      metadata: { aliases: m.raw.aliases, unit: m.raw.unit },
    }));

  const recordResults = recordable.length
    ? await inventoryService.recordBatch({
        workspaceId,
        items: recordable,
        source,
        createdBy,
        rawMessage: text,
      })
    : [];

  const unresolved = matched
    .filter((m) => !m.matched)
    .map((m) => ({
      product: m.raw.product,
      quantity: m.raw.quantity,
      type: m.raw.type,
      unit: m.raw.unit,
    }));

  logger.info('AI processed transcript', {
    workspaceId: workspaceId.toString(),
    recorded: recordResults.filter((r) => r.status === 'ok').length,
    unresolved: unresolved.length,
  });

  return {
    transcript: text,
    language: parsed.language,
    summary: parsed.summary,
    parsedItems: parsed.items,
    recordResults,
    unresolved,
  };
};

const processVoice = async ({ workspaceId, audioBuffer, filename, language, createdBy }) => {
  const text = await transcriptionService.transcribeBuffer(audioBuffer, {
    filename,
    language,
  });
  return processTranscript({
    workspaceId,
    text,
    source: TRANSACTION_SOURCES.AI_VOICE,
    createdBy,
  });
};

module.exports = { processTranscript, processVoice };
