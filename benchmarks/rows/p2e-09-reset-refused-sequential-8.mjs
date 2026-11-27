import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'sequential refused reset', input: 'seven sibling writes and a detached box reset', inputKind: 'plain', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`f${i}`, { type: 'string' }])), on: { type: 'boolean' }, box: { type: 'object', controls: { active: '/on === true' }, properties: { x: { type: 'string' }, y: { type: 'string' } } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { on: true, box: { x: 'old', y: 'old' } }, validationMode: ValidationMode.None }, createElement('span'))));
  const node = ref.current.node; const on = ref.current.findNode('/on'); const fields = Array.from({ length: 7 }, (_, i) => ref.current.findNode(`/f${i}`)); if (!node || !on || fields.some((field) => !field)) throw new Error('missing node'); let i = 0;
  return { run: () => { on.setValue(true); const box = ref.current.findNode('/box'); box.setValue({ x: 'last', y: 'early' }); for (const field of fields) field.setValue(`f${i}`); i++; on.setValue(false); box.resetSubtree(); }, check: () => { const values = Object.fromEntries(node.inactiveValues.map(({ path, value }) => [path, value])); return values['/box/x'] === 'last' && values['/box/y'] === 'early'; } };
} };
