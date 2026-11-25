import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'client mount', input: '100 string fields and unrelated default keys', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`f${i}`, { type: 'string' }])) }; const defaultValue = { name: 'n', age: 2 };
  const element = createElement(Form, { jsonSchema, defaultValue, validationMode: ValidationMode.None });
  let container = document.body.appendChild(document.createElement('div')); let root = createRoot(container); flushSync(() => root.render(element)); root.unmount(); container.remove();
  return { before: () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); }, run: () => flushSync(() => root.render(element)), check: () => container.querySelectorAll('input').length === 100, after: () => { root.unmount(); container.remove(); } };
} };
