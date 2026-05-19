"use strict";

const transcriptionService = require("./transcription.service");
const parserService = require("./parser.service");
const productResolver = require("./product-resolver.service");
const inventoryService = require("../inventory/inventory.service");
const logger = require("../../utils/logger");
const { TRANSACTION_SOURCES } = require("../../constants/inventory");

const toRecordPayload = (line) => ({
  productId: line.product._id,
  type: line.raw.type,
  quantity: line.raw.quantity,
  note: line.raw.note,
  metadata: {
    aliases: line.raw.aliases,
    unit: line.raw.unit,
    autoCreated: line.created,
  },
});

const toUnresolved = (line) => ({
  product: line.raw.product,
  quantity: line.raw.quantity,
  type: line.raw.type,
  unit: line.raw.unit,
});

const processTranscript = async ({
  workspaceId,
  text,
  source = TRANSACTION_SOURCES.AI_VOICE,
  createdBy,
}) => {
  const parsed = await parserService.parseInventoryMessage(text);
  const resolved = await productResolver.resolveItems(
    workspaceId,
    parsed.items,
  );

  const withProduct = resolved.filter((line) => line.product);
  const recordable = withProduct.map(toRecordPayload);

  const recordResults = recordable.length
    ? await inventoryService.recordBatch({
        workspaceId,
        items: recordable,
        source,
        createdBy,
        rawMessage: text,
      })
    : [];

  const unresolved = resolved.filter((line) => !line.product).map(toUnresolved);
  const createdProducts = withProduct
    .filter((line) => line.created)
    .map((line) => ({
      name: line.product.name,
      quantity: line.raw.quantity,
      type: line.raw.type,
      unit: line.raw.unit,
    }));

  logger.info("AI processed transcript", {
    workspaceId: workspaceId.toString(),
    recorded: recordResults.filter((r) => r.status === "ok").length,
    created: createdProducts.length,
    unresolved: unresolved.length,
    warnings: (parsed.warnings || []).length,
  });

  return {
    transcript: text,
    language: parsed.language,
    summary: parsed.summary,
    warnings: parsed.warnings || [],
    parsedItems: parsed.items,
    recordResults,
    createdProducts,
    unresolved,
  };
};

const processVoice = async ({
  workspaceId,
  audioBuffer,
  filename,
  createdBy,
}) => {
  const text = await transcriptionService.transcribeBuffer(audioBuffer, {
    filename,
  });
  return processTranscript({
    workspaceId,
    text,
    source: TRANSACTION_SOURCES.AI_VOICE,
    createdBy,
  });
};

module.exports = { processTranscript, processVoice };
