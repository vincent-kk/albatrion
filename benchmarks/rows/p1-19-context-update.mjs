import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
export default { pkg: '@canard/schema-form', fn: 'Form context update', input: 'nested context change', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { name: { type: 'string' } } }; const defaultValue = { name: 'Ada' }; const left = { session: { role: 'viewer' }, locale: 'ko' }; const right = { session: { role: 'editor' }, locale: 'ko' }; const tree = (context) => createElement(Form, { jsonSchema, defaultValue, context, validationMode: ValidationMode.None }); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container); let next = right;
  flushSync(() => root.render(tree(left)));
  return { run: () => flushSync(() => root.render(tree(next))), check: () => container.querySelector('input')?.value === 'Ada', after: () => { next = next === right ? left : right; } };
} };
