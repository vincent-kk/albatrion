import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'form reset', input: 'a 32-item object array whose items each watch a sibling', inputKind: 'plain', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string', controls: { watch: ['../a'] } } } } } } };
  const defaultValue = { items: Array.from({ length: 32 }, (_, k) => ({ a: `a${k}`, b: `b${k}` })) };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None }, createElement('span'))));
  if (!ref.current.findNode('/items/31/b')) throw new Error('missing item');
  return { run: () => ref.current.reset(), check: () => { const items = ref.current.getValue().items; return items.length === 32 && items[31].b === 'b31' && ref.current.findNode('/items/31/b').watchValues[0] === 'a31'; } };
} };
