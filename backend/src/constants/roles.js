'use strict';

const ROLES = Object.freeze({
  ADMIN: 'admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
});

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
