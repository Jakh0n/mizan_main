'use strict';

const mongoose = require('mongoose');
const { UNIT_VALUES, UNITS } = require('../../constants/inventory');

const productSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 64,
      set: (value) => {
        const normalized = String(value || '').trim();
        return normalized ? normalized : undefined;
      },
    },
    category: { type: String, trim: true, maxlength: 64, index: true },
    unit: { type: String, enum: UNIT_VALUES, default: UNITS.PIECE },
    price: { type: Number, default: 0, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    barcode: { type: String, trim: true, sparse: true, index: true },
    description: { type: String, maxlength: 1000 },
    aliases: { type: [String], default: [] },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

productSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
productSchema.index(
  { workspaceId: 1, sku: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sku: { $exists: true, $type: 'string', $nin: ['', null] },
    },
  }
);
productSchema.index({ name: 'text', aliases: 'text', category: 'text' });

productSchema.virtual('isLowStock').get(function isLowStock() {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
