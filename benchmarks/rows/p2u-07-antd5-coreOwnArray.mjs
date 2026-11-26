import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'own array write', input: 'uncontrolled whole-array input, same-length edit', inputKind: 'plain', kind: 'render', setup: () => {
  const Own = ({ defaultValue, onChange }) => createElement('input', { defaultValue: JSON.stringify(defaultValue), onChange: (event) => onChange(event.target.value.split(',')) }); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', title: 'List', items: { type: 'string' } }, note: { type: 'string', title: 'Note' } } }; const defaultValue = { list: ['a', 'b'], note: 'fixed' };
  let container, root, ref, input;
  return {
    before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, fieldInputMap: { '/list': Own }, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve)); input = [...container.querySelectorAll('input')].find((node) => node.value === '["a","b"]'); if (!input) throw new Error('missing list input'); },
    run: () => flushSync(() => { setter.call(input, 'x,y'); input.dispatchEvent(new window.Event('input', { bubbles: true })); }),
    check: () => JSON.stringify(ref.current.getValue()) === '{"list":["x","y"],"note":"fixed"}' && input.isConnected,
    after: () => { root.unmount(); container.remove(); },
  };
} };
