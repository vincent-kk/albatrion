import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, SetValueOption, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'virtual merge', input: 'one virtual member and disjoint sibling write', inputKind: 'repaired', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { box: { type: 'object', properties: { x: { type: 'string' }, y: { type: 'string' } } }, hidden: { type: 'string', controls: { active: 'false' } }, f: { type: 'string' } }, options: { virtual: { group: { fields: ['box'] } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { box: { x: 'a', y: 'b' } }, validationMode: ValidationMode.None }, createElement('span'))));
  const node = ref.current.node; const group = ref.current.findNode('/group'); const f = ref.current.findNode('/f'); if (!node || !group || !f) throw new Error('missing node'); let i = 0;
  return { run: () => { const value = String(i++); node.batch(() => { group.setValue([{ x: value }], SetValueOption.Merge); f.setValue(value); }); return value; }, check: (value) => { const result = ref.current.getValue(); return result.box.x === value && result.box.y === 'b' && result.f === value; } };
} };
