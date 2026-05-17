'use strict';

const TYPE_EMOJI = { in: 'IN', out: 'OUT', adjust: 'SET' };

const formatProcessedResult = (result) => {
  const lines = [];
  if (result.transcript) {
    lines.push(`<b>Transcript:</b> ${escape(result.transcript)}`);
  }

  const okItems = (result.recordResults || []).filter((r) => r.status === 'ok');
  if (okItems.length) {
    lines.push('');
    lines.push('<b>Updated:</b>');
    okItems.forEach((r) => {
      const t = r.transaction;
      lines.push(
        `• ${TYPE_EMOJI[t.type] || t.type} ${t.quantity} ${escape(t.unit || '')} — ${escape(t.productName)} (now ${t.newStock})`
      );
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
    lines.push('<b>Not recognized (please add as products):</b>');
    result.unresolved.forEach((u) => {
      lines.push(`• ${escape(u.product)} (${u.quantity} ${escape(u.unit || '')})`);
    });
  }

  if (!okItems.length && !errors.length && !(result.unresolved || []).length) {
    lines.push('No inventory actions detected in your message.');
  }

  return lines.join('\n');
};

const escape = (text = '') =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

module.exports = { formatProcessedResult };
