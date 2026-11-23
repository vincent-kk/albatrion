import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'batch reset pending', input: 'eight sibling writes and object reset', inputKind: 'repaired', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { obj: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } }, ...Object.fromEntries(Array.from({ length: 8 }, (_, k) => [`f${k}`, { type: 'string' }])) } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { obj: { a: 'x', b: 'y' } }, validationMode: ValidationMode.None }, createElement('span'))));
  const node = ref.current.node; const obj = ref.current.findNode('/obj'); const fields = Array.from({ length: 8 }, (_, k) => ref.current.findNode(`/f${k}`)); if (!node || !obj || fields.some((field) => !field)) throw new Error('missing node'); let i = 0;
  return { run: () => { const current = i++; node.batch(() => { for (let k = 0; k < 8; k++) fields[k].setValue(`v${current}_${k}`); obj.resetSubtree(); }); return current; }, check: (current) => { const value = ref.current.getValue(); return value.obj.a === 'x' && value.obj.b === 'y' && fields.every((_, k) => value[`f${k}`] === `v${current}_${k}`); } };
} };
