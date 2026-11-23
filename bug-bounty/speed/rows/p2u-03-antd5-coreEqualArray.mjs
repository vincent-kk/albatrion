import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'equal array write', input: 'two-item array written with equal content', inputKind: 'plain', kind: 'render', setup: async () => {
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } }; const defaultValue = { list: ['a', 'b'] };
  const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve));
  const initial = [...container.querySelectorAll('input')]; if (initial.length < 2) throw new Error('missing array inputs'); let literal;
  return { before: () => { literal = { list: ['a', 'b'] }; }, run: () => flushSync(() => ref.current.setValue(literal)), check: () => { const inputs = [...container.querySelectorAll('input')]; return JSON.stringify(ref.current.getValue()) === '{"list":["a","b"]}' && inputs.length === initial.length && inputs.every((node, index) => node === initial[index]); } };
} };
