import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'context Error cause update', input: 'same-message errors with distinct non-enumerable causes', inputKind: 'repaired', kind: 'render', setup: () => {
  const makeError = (cause) => Object.defineProperty(new Error('fail'), 'cause', { value: cause, writable: true, configurable: true }); const left = { error: makeError('one') }; const right = { error: makeError('two') }; let seen;
  const Probe = ({ node }) => { seen = node.watchValues?.[0]?.error; return null; }; const jsonSchema = { type: 'object', properties: { field: { type: 'string', controls: { watch: ['@'] } } } }; const defaultValue = { field: 'a' }; const fieldInputMap = { '/field': Probe };
  const root = createRoot(document.body.appendChild(document.createElement('div'))); const tree = (context) => createElement(Form, { jsonSchema, defaultValue, context, fieldInputMap, validationMode: ValidationMode.None }); flushSync(() => root.render(tree(left)));
  return { before: () => flushSync(() => root.render(tree(left))), run: () => flushSync(() => root.render(tree(right))), check: () => seen instanceof Error && seen.message === 'fail' };
} };
