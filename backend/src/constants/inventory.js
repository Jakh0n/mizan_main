'use strict';

const TRANSACTION_TYPES = Object.freeze({
  IN: 'in',
  OUT: 'out',
  ADJUST: 'adjust',
});

const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES);

const TRANSACTION_SOURCES = Object.freeze({
  MANUAL: 'manual',
  TELEGRAM: 'telegram',
  AI_VOICE: 'ai_voice',
  IMPORT: 'import',
});

const TRANSACTION_SOURCE_VALUES = Object.values(TRANSACTION_SOURCES);

const UNITS = Object.freeze({
  PIECE: 'pcs',
  KG: 'kg',
  G: 'g',
  L: 'l',
  ML: 'ml',
  BOX: 'box',
  PACK: 'pack',
});

const UNIT_VALUES = Object.values(UNITS);

module.exports = {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_SOURCES,
  TRANSACTION_SOURCE_VALUES,
  UNITS,
  UNIT_VALUES,
};
