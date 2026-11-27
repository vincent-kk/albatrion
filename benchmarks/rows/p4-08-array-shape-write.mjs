import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'array item write', input: 'one item at a time of a 32-item root string array', inputKind: 'plain', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'array', items: { type: 'string' } }; const defaultValue = Array.from({ length: 32 }, (_, k) => `old${k}`);
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None }, createElement('span'))));
  const items = Array.from({ length: 32 }, (_, k) => ref.current.findNode(`/${k}`)); if (items.some((item) => !item)) throw new Error('missing item'); let i = 0;
  return { run: () => { const index = i % 32; const value = `v${i++}`; items[index].setValue(value); return [index, value]; }, check: ([index, value]) => { const result = ref.current.getValue(); return result.length === 32 && result[index] === value; } };
} };
