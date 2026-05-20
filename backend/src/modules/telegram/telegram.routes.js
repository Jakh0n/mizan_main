'use strict';

const { Router } = require('express');
const controller = require('./telegram.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { ROLES } = require('../../constants/roles');

const router = Router();

router.post('/webhook', controller.webhook);
router.post(
  '/register-webhook',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.OWNER),
  controller.registerWebhook
);

module.exports = router;
