import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';
export default { pkg: '@canard/schema-form-mui-plugin', fn: 'string switch mount', input: 'enum switch with aliases', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { mode: { type: 'string', enum: ['on', 'off'], presentation: { inputType: 'switch', FieldInputProps: { alias: { on: 'Alias on', off: 'Alias off' } } } } } }; const defaultValue = { mode: 'on' }; const context = {};
  const element = createElement(Form, { jsonSchema, defaultValue, context, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer });
  return { run: () => { const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container); flushSync(() => root.render(element)); return { root, container }; }, check: ({ container }) => !!container.querySelector('input[type=checkbox]'), after: ({ root, container }) => { root.unmount(); container.remove(); } };
} };
