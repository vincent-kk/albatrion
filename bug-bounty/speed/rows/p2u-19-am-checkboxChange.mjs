import '../dom.mjs';
import '../css.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

export default { pkg: '@canard/schema-form-antd-mobile-plugin', fn: 'checkbox change', input: 'two options and unknown initial value', inputKind: 'repaired', kind: 'render', setup: async () => {
  const jsonSchema = { type: 'array', items: { type: 'string', enum: ['news', 'sports'] }, presentation: { inputType: 'checkbox' } }; const defaultValue = ['legacy', 'sports'];
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve));
  let input;
  return { before: async () => { input = container.querySelectorAll('input[type=checkbox]')[0]; if (input.checked) flushSync(() => input.dispatchEvent(new MouseEvent('click', { bubbles: true }))); flushSync(() => ref.current.setValue(['legacy', 'sports'])); await new Promise((resolve) => setImmediate(resolve)); input = container.querySelectorAll('input[type=checkbox]')[0]; setter.call(input, false); }, run: () => flushSync(() => input.dispatchEvent(new MouseEvent('click', { bubbles: true }))), check: () => { const value = ref.current.getValue(); return value.includes('news') && value.includes('sports'); } };
} };
