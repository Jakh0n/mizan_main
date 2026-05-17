'use strict';

const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, lowercase: true, trim: true, index: true },
    industry: {
      type: String,
      enum: ['restaurant', 'cafe', 'market', 'warehouse', 'other'],
      default: 'other',
    },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD', uppercase: true, maxlength: 6 },
    telegramChatId: { type: String, index: true, sparse: true },
    settings: {
      lowStockThreshold: { type: Number, default: 5, min: 0 },
      currencySymbol: { type: String, default: '$' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
