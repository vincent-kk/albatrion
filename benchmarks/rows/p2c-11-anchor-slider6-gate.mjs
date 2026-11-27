import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd6-plugin';

export default { pkg: '@canard/schema-form', fn: 'slider gate and focus', input: 'conditional Ant 6 slider', inputKind: 'repaired', kind: 'render', setup: () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const jsonSchema = { type: 'object', properties: { enabled: { type: 'boolean' }, level: { type: 'number', minimum: 0, maximum: 10, multipleOf: 1, presentation: { inputType: 'slider' }, controls: { active: '../enabled === true' } } } }; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { enabled: false, level: 4 }, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  const enabled = ref.current.findNode('/enabled'); if (!enabled) throw new Error('missing /enabled');
  return { before: async () => { flushSync(() => enabled.setValue(false)); await new Promise((resolve) => setImmediate(resolve)); }, run: async () => { flushSync(() => enabled.setValue(true)); await new Promise((resolve) => setImmediate(resolve)); flushSync(() => ref.current.focus('/level')); for (let i = 0; i < 3; i++) await new Promise((resolve) => setImmediate(resolve)); }, check: () => ref.current.getValue().enabled === true && !!container.querySelector('.ant-slider') };
} };
