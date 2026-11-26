import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, isVirtualNode, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'virtual divergence getter', input: '150000 reads over 128 independent nodes', inputKind: 'repaired', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' }, note: { type: 'string' } }, options: { virtual: { period: { fields: ['start', 'end'] } } } };
  const nodes = Array.from({ length: 128 }, () => { const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div'))); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { start: 'a', end: 'b', note: 'n' }, validationMode: ValidationMode.None }, createElement('span')))); const node = ref.current.findNode('/period'); if (!isVirtualNode(node)) throw new Error('missing virtual node'); return node; });
  return { run: () => { let sink; for (let i = 0; i < 150000; i++) sink = nodes[i % nodes.length].isDivergent; return sink; }, check: (sink) => sink === false };
} };
