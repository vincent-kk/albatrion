import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, isVirtualNode, ValidationMode } from '@canard/schema-form';

/**
 * Mounts a form with one virtual group `period` over `start` and `end`.
 * @returns the virtual group node of that form
 */
const virtualNode = () => {
  const jsonSchema = { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' }, note: { type: 'string' } }, options: { virtual: { period: { fields: ['start', 'end'] } } } };
  const ref = createRef();
  const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { start: 'a', end: 'b', note: 'n' }, validationMode: ValidationMode.None }, createElement('span'))));
  const node = ref.current.findNode('/period');
  if (!isVirtualNode(node)) throw new Error('missing virtual node');
  return node;
};

export default { pkg: '@canard/schema-form', fn: 'virtual defaultValue', input: '50000 defaultValue reads over 128 independent virtual nodes', inputKind: 'repaired', kind: 'micro', setup: () => {
  const nodes = Array.from({ length: 128 }, virtualNode);
  return { run: () => { let sink; for (let i = 0; i < 50000; i++) sink = nodes[i % nodes.length].defaultValue; return sink; }, check: (sink) => Array.isArray(sink) && sink.length === 2 };
} };
