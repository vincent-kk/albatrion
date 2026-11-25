import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'watchValues', input: '50000 reads over 128 fields of one form, every other field watching a sibling', inputKind: 'plain', kind: 'micro', setup: () => {
  const properties = { source: { type: 'string' } }; for (let k = 0; k < 64; k++) { properties[`w${k}`] = { type: 'string', controls: { watch: ['../source'] } }; properties[`p${k}`] = { type: 'string' }; }
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema: { type: 'object', properties }, defaultValue: { source: 's' }, validationMode: ValidationMode.None }, createElement('span'))));
  const nodes = []; for (let k = 0; k < 64; k++) nodes.push(ref.current.findNode(`/w${k}`), ref.current.findNode(`/p${k}`)); if (nodes.some((node) => !node)) throw new Error('missing node');
  return { run: () => { let sink; for (let i = 0; i < 50000; i++) sink = nodes[i % nodes.length].watchValues; return sink; }, check: (sink) => Array.isArray(sink) && sink.length === 0 && nodes[0].watchValues[0] === 's' };
} };
