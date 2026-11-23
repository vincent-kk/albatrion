import '../dom.mjs';
import '../css.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode, ErrorVisibility, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

export default { pkg: '@canard/schema-form-antd-mobile-plugin', fn: 'branch error validation', input: 'array minItems error', inputKind: 'repaired', kind: 'render', setup: async () => {
  const jsonSchema = { type: 'object', properties: { field: { type: 'array', items: { type: 'string' }, minItems: 2 } } }; const defaultValue = { field: ['a'] };
  registerPlugin({ validator: { compile: () => (value) => Array.isArray(value?.field) && value.field.length < 2 ? [{ keyword: 'minItems', dataPath: '/field', message: 'minItems constraint' }] : null, compileGuard: () => { throw new Error('unexpected guard'); } } });
  const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.OnRequest, errorVisibility: ErrorVisibility.Always, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve));
  return { before: () => flushSync(() => ref.current.reset()), run: async () => { await ref.current.validate(); await new Promise((resolve) => setImmediate(resolve)); flushSync(() => {}); }, check: () => ref.current.getErrors().some((error) => error.dataPath === '/field' && error.keyword === 'minItems') };
} };
