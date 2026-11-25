import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ErrorVisibility, Form, registerPlugin, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

export default { pkg: '@canard/schema-form-mui-plugin', fn: 'branch error validation', input: 'array minItems error', inputKind: 'repaired', kind: 'render', setup: () => {
  registerPlugin({ validator: { compile: () => (value) => Array.isArray(value?.field) && value.field.length < 2 ? [{ keyword: 'minItems', dataPath: '/field', message: 'minItems constraint' }] : null, compileGuard: () => { throw new Error('unexpected guard'); } } });
  const jsonSchema = { type: 'object', properties: { field: { type: 'array', minItems: 2, items: { type: 'string' } } } }; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { field: ['a'] }, validationMode: ValidationMode.OnRequest, errorVisibility: ErrorVisibility.Always, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  return { before: () => flushSync(() => ref.current.reset()), run: async () => { await ref.current.validate(); await new Promise((resolve) => setImmediate(resolve)); flushSync(() => {}); }, check: () => ref.current.getErrors().some((error) => error.dataPath === '/field' && error.keyword === 'minItems') };
} };
