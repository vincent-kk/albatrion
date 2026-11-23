import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'core form mount', input: 'name and count leaves', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { name: { type: 'string', title: 'Name' }, count: { type: 'number', title: 'Count' } } }; const defaultValue = { name: 'Ada', count: 3 };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => { const inputs = container.querySelectorAll('input'); return inputs[0]?.value === 'Ada' && inputs[1]?.value === '3' && JSON.stringify(ref.current.getValue()) === '{"name":"Ada","count":3}'; },
    after: () => { root.unmount(); container.remove(); },
  };
} };
