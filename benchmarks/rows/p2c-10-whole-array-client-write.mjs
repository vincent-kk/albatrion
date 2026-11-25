import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

const Whole = ({ defaultValue, onChange }) => createElement('input', { defaultValue: JSON.stringify(defaultValue), onChange: (event) => onChange([event.target.value]) });
export default { pkg: '@canard/schema-form', fn: 'whole array root write', input: 'uncontrolled one-item array input', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } }; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { list: ['a'] }, validationMode: ValidationMode.None, fieldInputMap: { '/list': Whole } })));
  return { before: () => flushSync(() => ref.current.setValue({ list: ['a'] })), run: () => flushSync(() => ref.current.setValue({ list: ['b'] })), check: () => JSON.stringify(ref.current.getValue()) === '{"list":["b"]}' && !!container.querySelector('input') };
} };
