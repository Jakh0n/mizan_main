'use strict';

const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const productRoutes = require('../modules/products/product.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const aiRoutes = require('../modules/ai/ai.routes');
const telegramRoutes = require('../modules/telegram/telegram.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
);

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/ai', aiRoutes);
router.use('/telegram', telegramRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
