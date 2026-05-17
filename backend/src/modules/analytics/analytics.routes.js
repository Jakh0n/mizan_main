'use strict';

const { Router } = require('express');
const controller = require('./analytics.controller');
const { authenticate } = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/overview', controller.overview);
router.get('/trend', controller.trend);
router.get('/top-products', controller.topProducts);
router.get('/low-stock', controller.lowStock);

module.exports = router;
