import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';
export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'checkbox change', input: 'two string options', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'array', items: { type: 'string', enum: ['news', 'sports'] }, presentation: { inputType: 'checkbox' } }; const defaultValue = ['news']; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set; let container, root, ref, input;
  return { before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); await new Promise((resolve) => setTimeout(resolve, 20)); input = container.querySelectorAll('input[type=checkbox]')[1]; setter.call(input, false); }, run: () => flushSync(() => input.dispatchEvent(new MouseEvent('click', { bubbles: true }))), check: () => JSON.stringify(ref.current.getValue()) === '["news","sports"]', after: () => { root.unmount(); container.remove(); } };
} };
