import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'external array write', input: 'uncontrolled one-item array input rewritten from outside', inputKind: 'repaired', kind: 'render', setup: () => {
  const Whole = ({ defaultValue, onChange }) => createElement('input', { defaultValue: JSON.stringify(defaultValue), onChange: (event) => onChange([event.target.value]) });
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } }; const ref = createRef();
  const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { list: ['a'] }, fieldInputMap: { '/list': Whole }, validationMode: ValidationMode.None })));
  const list = ref.current.findNode('/list'); if (!list) throw new Error('missing list node');
  return { before: () => flushSync(() => list.setValue(['a'])), run: () => flushSync(() => list.setValue(['b'])), check: () => JSON.stringify(ref.current.getValue().list) === '["b"]' };
} };
