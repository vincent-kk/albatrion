import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
const WholeArray = ({ defaultValue, onChange }) => createElement('input', { defaultValue: JSON.stringify(defaultValue), onChange: (event) => onChange([event.target.value]) });
export default { pkg: '@canard/schema-form', fn: 'whole array own write', input: 'uncontrolled array input', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } }; const defaultValue = { list: ['a'] }; const fieldInputMap = { '/list': WholeArray }; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; let container, root, ref, input;
  return { before: () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputMap }, createElement(Form.Render, { path: '/list' }, ({ Input }) => createElement(Input))))); input = container.querySelector('input'); }, run: () => flushSync(() => { setter.call(input, 'own'); input.dispatchEvent(new window.Event('input', { bubbles: true })); }), check: () => JSON.stringify(ref.current.getValue()) === '{"list":["own"]}' && container.querySelector('input') === input, after: () => { root.unmount(); container.remove(); } };
} };
