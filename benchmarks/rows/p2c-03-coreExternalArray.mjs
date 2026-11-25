import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'external array child write', input: 'three options and a one-item array', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { value: { type: 'array', items: { type: 'string', enum: ['a', 'b', 'c'] }, presentation: { inputType: 'checkbox' } } } }; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { value: ['a'] }, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  let item = ref.current.findNode('/value/0'); if (!item) throw new Error('missing array item');
  return { before: async () => { flushSync(() => ref.current.setValue({ value: ['a'] })); await new Promise((resolve) => setImmediate(resolve)); item = ref.current.findNode('/value/0'); }, run: () => flushSync(() => item.setValue('b')), check: () => JSON.stringify(ref.current.getValue()) === '{"value":["b"]}', after: () => new Promise((resolve) => setImmediate(resolve)) };
} };
