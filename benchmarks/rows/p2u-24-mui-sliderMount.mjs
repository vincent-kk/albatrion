import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

export default { pkg: '@canard/schema-form-mui-plugin', fn: 'slider mount', input: 'integer slider with one thumb', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { level: { type: 'number', title: 'Level', minimum: 0, maximum: 10, multipleOf: 1, format: 'slider', presentation: { inputType: 'slider' } } } }; const defaultValue = { level: 4 };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => ref.current.getValue().level === 4 && container.querySelectorAll('input[type=range]').length === 1 && container.querySelector('input[type=range]').value === '4',
    after: () => { root.unmount(); container.remove(); },
  };
} };
