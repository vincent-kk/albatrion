import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, SetValueOption, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'refused reset in a batch', input: 'seven sibling writes, a merge that deactivates the box and a subtree reset', inputKind: 'repaired', kind: 'micro', setup: () => {
  const fields = Object.fromEntries(Array.from({ length: 7 }, (_, k) => ['f' + k, { type: 'string' }]));
  const jsonSchema = { type: 'object', properties: { ...fields, on: { type: 'boolean' }, box: { type: 'object', controls: { active: '/on === true' }, properties: { x: { type: 'string' }, y: { type: 'string' } } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { on: true, box: { x: 'old', y: 'old' } }, validationMode: ValidationMode.None }, createElement('span'))));
  const node = ref.current.node; const on = ref.current.findNode('/on'); const siblings = Array.from({ length: 7 }, (_, k) => ref.current.findNode('/f' + k)); if (!node || !on || siblings.some((field) => !field)) throw new Error('missing node'); let i = 0;
  return { run: () => { const current = i++; on.setValue(true); const box = ref.current.findNode('/box'); node.batch(() => { box.setValue({ x: 'early', y: 'early' }); for (const field of siblings) field.setValue('f' + current); node.setValue({ on: false, box: { x: 'last' } }, SetValueOption.Merge); box.resetSubtree(); }); return current; }, check: (current) => { const value = ref.current.getValue(); return value.on === false && siblings.every((_, k) => value['f' + k] === 'f' + current); } };
} };
