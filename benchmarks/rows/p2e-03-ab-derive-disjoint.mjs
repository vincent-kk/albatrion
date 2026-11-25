import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'disjoint derived writes', input: 'one source and two derived siblings', inputKind: 'plain', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { src: { type: 'string', controls: { injectTo: (v) => typeof v === 'string' ? { '../p': v, '../q': `${v}!` } : {} } }, p: { type: 'string' }, q: { type: 'string' }, obj: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: {}, validationMode: ValidationMode.None }, createElement('span'))));
  const src = ref.current.findNode('/src'); if (!src) throw new Error('missing /src'); let i = 0;
  return { run: () => { const value = `s${i++}`; src.setValue(value); return value; }, check: (value) => { const result = ref.current.getValue(); return result.p === value && result.q === `${value}!`; } };
} };
