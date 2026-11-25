import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'aliased client mount', input: 'two references to a derived object', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', $defs: { entry: { type: 'object', properties: { a: { type: 'string', default: 'a' }, b: { type: 'string', controls: { derived: '(../a) + "!"' } } } } }, properties: { x: { $ref: '#/$defs/entry' }, y: { $ref: '#/$defs/entry' } } };
  let ref = createRef(); let container = document.body.appendChild(document.createElement('div')); let root = createRoot(container); const tree = () => createElement(Form, { ref, jsonSchema, validationMode: ValidationMode.None }, createElement('span')); flushSync(() => root.render(tree())); root.unmount(); container.remove();
  return { before: () => { ref = createRef(); container = document.body.appendChild(document.createElement('div')); root = createRoot(container); }, run: () => flushSync(() => root.render(tree())), check: () => { const value = ref.current.getValue(); return value.x?.a === 'a' && value.y?.a === 'a'; }, after: () => { root.unmount(); container.remove(); } };
} };
