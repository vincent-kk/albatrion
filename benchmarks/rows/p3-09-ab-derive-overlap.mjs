import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'derive overlapping targets', input: 'one rule writing an object and a field inside it', inputKind: 'repaired', kind: 'micro', setup: () => {
  const injectTo = (value) => typeof value !== 'string' ? {} : { '../obj': { a: value, b: value }, '../obj/b': value + '!' };
  const jsonSchema = { type: 'object', properties: { src: { type: 'string', controls: { injectTo } }, p: { type: 'string' }, q: { type: 'string' }, obj: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: {}, validationMode: ValidationMode.None }, createElement('span'))));
  const src = ref.current.findNode('/src'); if (!src) throw new Error('missing src'); let i = 0;
  return { run: () => { const value = 's' + i++; src.setValue(value); return value; }, check: (value) => ref.current.getValue().src === value };
} };
