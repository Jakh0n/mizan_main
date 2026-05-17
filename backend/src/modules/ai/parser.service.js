'use strict';

const env = require('../../config/env');
const { getClient } = require('./openai.client');
const logger = require('../../utils/logger');
const { TRANSACTION_TYPE_VALUES } = require('../../constants/inventory');

const SYSTEM_PROMPT = `You are an expert inventory assistant for restaurants, cafes, markets and warehouses.
You receive natural language messages (often spoken) in multiple languages (English, Russian, Uzbek, etc.).
Your job is to extract every inventory event mentioned and return STRICT JSON only.

Output schema:
{
  "language": "<detected language code, e.g. en, ru, uz>",
  "items": [
    {
      "product": "<product name in lowercase>",
      "aliases": ["<original spoken name>"],
      "type": "in" | "out" | "adjust",
      "quantity": <positive number>,
      "unit": "pcs" | "kg" | "g" | "l" | "ml" | "box" | "pack",
      "note": "<short context, optional>"
    }
  ],
  "summary": "<one short sentence describing the actions>"
}

Rules:
- "in" means stock received / purchased / arrived / delivered.
- "out" means stock sold / used / consumed / removed.
- "adjust" only when user explicitly sets a stock level.
- Normalize quantities to numbers (e.g. "two and a half" -> 2.5).
- If no items detected, return { "language": "..", "items": [], "summary": ".." }.
- Never include any text outside the JSON.`;

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_e) {
      return null;
    }
  }
};

const normalizeItem = (item) => {
  if (!item || !item.product) return null;
  const type = TRANSACTION_TYPE_VALUES.includes(item.type) ? item.type : 'in';
  const quantity = Number(item.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  return {
    product: String(item.product).trim().toLowerCase(),
    aliases: Array.isArray(item.aliases) ? item.aliases : [],
    type,
    quantity,
    unit: item.unit || 'pcs',
    note: item.note || '',
  };
};

const parseInventoryMessage = async (text) => {
  if (!text || !text.trim()) {
    return { language: 'unknown', items: [], summary: '' };
  }

  const client = getClient();
  const completion = await client.chat.completions.create({
    model: env.openai.chatModel,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  const parsed = safeParse(raw) || {};
  const items = Array.isArray(parsed.items)
    ? parsed.items.map(normalizeItem).filter(Boolean)
    : [];

  logger.debug('AI parsed inventory message', {
    itemCount: items.length,
    language: parsed.language,
  });

  return {
    language: parsed.language || 'unknown',
    items,
    summary: parsed.summary || '',
  };
};

module.exports = { parseInventoryMessage };
