import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

export default { pkg: '@canard/schema-form-mui-plugin', fn: 'date picker mount', input: 'bounded date, picker closed', inputKind: 'repaired', kind: 'render', setup: () => {
  const matchMedia = (query) => ({ matches: /pointer:\s*fine/.test(query), media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }); window.matchMedia = globalThis.matchMedia = matchMedia;
  const jsonSchema = { type: 'object', properties: { day: { type: 'string', format: 'date', title: 'Day', presentation: { FieldInputProps: { minimum: '2025-05-10', maximum: '2025-05-20' } } } } }; const defaultValue = { day: '2025-05-15' };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => ref.current.getValue().day === '2025-05-15' && !!container.querySelector('input') && !document.body.querySelector('[role=grid]'),
    after: () => { root.unmount(); container.remove(); },
  };
} };
