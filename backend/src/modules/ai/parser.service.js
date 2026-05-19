"use strict";

const env = require("../../config/env");
const { getClient } = require("./openai.client");
const logger = require("../../utils/logger");
const { TRANSACTION_TYPE_VALUES } = require("../../constants/inventory");

const SYSTEM_PROMPT = `You are an expert inventory assistant for restaurants, cafes, markets and warehouses.
You receive natural language messages (often spoken) in Uzbek, Turkish, Russian, English, and other languages.
Your job is to extract inventory events with high precision and return STRICT JSON only.

Output schema:
{
  "language": "<detected language code, e.g. en, ru, uz, tr>",
  "items": [
    {
      "product": "<product name in lowercase>",
      "aliases": ["<original spoken name variants>"],
      "type": "in" | "out" | "adjust",
      "quantity": <positive number>,
      "unit": "pcs" | "kg" | "g" | "l" | "ml" | "box" | "pack",
      "note": "<short context, optional>"
    }
  ],
  "summary": "<one short sentence describing the actions>",
  "warnings": ["<optional parsing warning strings>"]
}

Rules:
- "in" = stock received, purchased, arrived, delivered.
  Uzbek/Turkish examples mapped to "in": oldim, oldik, sotib oldim, keldi, keltirdim, geldi, aldim, satın aldım, aldik, olmoqchiman, alacağım.
- "out" = stock sold, used, consumed, removed.
  Uzbek/Turkish examples mapped to "out": sotildi, sotdik, ishlatildi, ishlatdik, sarf qilindi, tükendi, bitti, kullanıldı, satıldı.
- "adjust" only when user explicitly sets a stock level.
- Keep product names short and canonical (e.g. "ekmek", "non", "kola", "sut", "et", "go'sht").
- Normalize quantities to numbers (e.g. "ikki yuz" -> 200, "yuz" -> 100, "yarim" -> 0.5).
- Normalize units to allowed enum values only.
- Split compound messages into multiple items.
- If uncertain, still return best-effort items and add explanation to warnings.
- If no items detected, return { "language": "..", "items": [], "summary": "..", "warnings": [] }.
- Never include any text outside the JSON.`;

const UNIT_SYNONYMS = Object.freeze({
  pcs: ["pcs", "pc", "piece", "pieces", "ta", "dona", "adet", "adetler", "шт", "штук"],
  kg: ["kg", "kilogram", "kilo", "kq", "кг"],
  g: ["g", "gram", "gr", "гр"],
  l: ["l", "liter", "litre", "litr", "lt", "л"],
  ml: ["ml", "milliliter", "millilitre", "миллилитр", "мл"],
  box: ["box", "boxes", "quti", "qutı", "kutu", "korobka", "коробка"],
  pack: ["pack", "packs", "paket", "упаковка", "уп"],
});

const UNIT_LOOKUP = Object.entries(UNIT_SYNONYMS).reduce((acc, [unit, aliases]) => {
  aliases.forEach((alias) => {
    acc[String(alias).toLowerCase()] = unit;
  });
  return acc;
}, {});

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

const normalizeProductName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[`’]/g, "'")
    .replace(/\s+/g, " ");

const normalizeUnit = (value) => {
  if (!value) return "pcs";
  const normalized = String(value).trim().toLowerCase();
  return UNIT_LOOKUP[normalized] || "pcs";
};

const normalizeItem = (item) => {
  if (!item || !item.product) return null;
  const type = TRANSACTION_TYPE_VALUES.includes(item.type) ? item.type : "in";
  const quantity = Number(item.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  return {
    product: normalizeProductName(item.product),
    aliases: Array.isArray(item.aliases)
      ? item.aliases.map(normalizeProductName).filter(Boolean)
      : [],
    type,
    quantity,
    unit: normalizeUnit(item.unit),
    note: item.note || "",
  };
};

const parseInventoryMessage = async (text) => {
  if (!text || !text.trim()) {
    return { language: "unknown", items: [], summary: "" };
  }

  const client = getClient();
  const completion = await client.chat.completions.create({
    model: env.openai.chatModel,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  const parsed = safeParse(raw) || {};
  const items = Array.isArray(parsed.items)
    ? parsed.items.map(normalizeItem).filter(Boolean)
    : [];
  const warnings = Array.isArray(parsed.warnings)
    ? parsed.warnings.map((w) => String(w).trim()).filter(Boolean)
    : [];

  logger.debug("AI parsed inventory message", {
    itemCount: items.length,
    language: parsed.language,
    warningCount: warnings.length,
  });

  return {
    language: parsed.language || "unknown",
    items,
    summary: parsed.summary || "",
    warnings,
  };
};

module.exports = { parseInventoryMessage };
