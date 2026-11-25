import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'time range mount', input: 'lower-case Z start time', inputKind: 'repaired', kind: 'render', setup: () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const jsonSchema = { type: 'array', format: 'time-range', items: { type: 'string' } }; const defaultValue = ['10:00:00z', '15:00:00+00:00'];
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => JSON.stringify(ref.current.getValue()) === JSON.stringify(defaultValue) && !!container.querySelector('input[date-range=start]'),
    after: () => { root.unmount(); container.remove(); },
  };
} };
