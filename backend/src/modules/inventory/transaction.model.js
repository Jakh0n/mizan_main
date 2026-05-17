'use strict';

const mongoose = require('mongoose');
const {
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_SOURCE_VALUES,
  TRANSACTION_SOURCES,
} = require('../../constants/inventory');

const transactionSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: { type: String, required: true },
    type: { type: String, enum: TRANSACTION_TYPE_VALUES, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    source: {
      type: String,
      enum: TRANSACTION_SOURCE_VALUES,
      default: TRANSACTION_SOURCES.MANUAL,
    },
    note: { type: String, maxlength: 500 },
    rawMessage: { type: String, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

transactionSchema.index({ workspaceId: 1, createdAt: -1 });
transactionSchema.index({ workspaceId: 1, productId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryTransaction', transactionSchema);
