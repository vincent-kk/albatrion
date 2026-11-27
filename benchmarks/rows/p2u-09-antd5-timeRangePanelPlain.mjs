import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'time range panel', input: 'unbounded time range, start input opened', inputKind: 'repaired', kind: 'render', setup: () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const jsonSchema = { type: 'array', format: 'time-range', items: { type: 'string' } }; const defaultValue = ['10:00:00+00:00', '15:00:00+00:00'];
  let container, root, ref, start;
  return {
    before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve)); start = container.querySelector('input[date-range=start]'); },
    run: () => flushSync(() => { start.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); start.dispatchEvent(new MouseEvent('click', { bubbles: true })); }),
    check: () => JSON.stringify(ref.current.getValue()) === JSON.stringify(defaultValue) && !!document.body.querySelector('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-panel'),
    after: () => { root.unmount(); container.remove(); },
  };
} };
