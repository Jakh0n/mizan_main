'use strict';

const TYPE_LABEL = { in: 'IN', out: 'OUT', adjust: 'SET' };

const escape = (text = '') =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatLine = (type, quantity, unit, productName, suffix = '') => {
  const label = TYPE_LABEL[type] || type;
  const extra = suffix ? ` ${suffix}` : '';
  return `• ${label} ${quantity} ${escape(unit || '')} — ${escape(productName)}${extra}`;
};

const formatProcessedResult = (result) => {
  const lines = [];
  if (result.transcript) {
    lines.push(`<b>Transcript:</b> ${escape(result.transcript)}`);
  }

  const okItems = (result.recordResults || []).filter((r) => r.status === 'ok');
  const createdNames = new Set((result.createdProducts || []).map((c) => c.name.toLowerCase()));

  if (okItems.length) {
    lines.push('');
    lines.push('<b>Updated:</b>');
    okItems.forEach((r) => {
      const t = r.transaction;
      const isNew = createdNames.has(t.productName.toLowerCase());
      const suffix = isNew ? '(new product, now ' + t.newStock + ')' : `(now ${t.newStock})`;
      lines.push(formatLine(t.type, t.quantity, t.unit, t.productName, suffix));
    });
  }

  const errors = (result.recordResults || []).filter((r) => r.status === 'error');
  if (errors.length) {
    lines.push('');
    lines.push('<b>Errors:</b>');
    errors.forEach((e) => lines.push(`• ${escape(e.error)}`));
  }

  if ((result.unresolved || []).length) {
    lines.push('');
    lines.push('<b>Could not process:</b>');
    result.unresolved.forEach((u) => {
      lines.push(`• ${escape(u.product)} (${u.quantity} ${escape(u.unit || '')})`);
    });
  }

  if (!okItems.length && !errors.length && !(result.unresolved || []).length) {
    lines.push('No inventory actions detected in your message.');
  }

  return lines.join('\n');
};

module.exports = { formatProcessedResult };
