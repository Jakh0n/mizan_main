'use strict';

const ok = (res, data, message = 'OK', meta) =>
  res.status(200).json({ success: true, message, data, ...(meta && { meta }) });

const created = (res, data, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

const noContent = (res) => res.status(204).send();

const paginated = (res, items, pagination, message = 'OK') =>
  res.status(200).json({
    success: true,
    message,
    data: items,
    meta: { pagination },
  });

module.exports = { ok, created, noContent, paginated };
