'use strict';

const { Router } = require('express');
const controller = require('./product.controller');
const validation = require('./product.validation');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const { ROLES } = require('../../constants/roles');

const router = Router();
router.use(authenticate);

router.get('/', validate(validation.list), controller.list);
router.get('/:id', validate(validation.getOne), controller.getOne);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER),
  validate(validation.create),
  controller.create
);
router.patch(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER),
  validate(validation.update),
  controller.update
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER),
  validate(validation.remove),
  controller.remove
);

module.exports = router;
