import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

export default { pkg: '@canard/schema-form-mui-plugin', fn: 'date picker panel', input: 'bounded date, calendar opened', inputKind: 'repaired', kind: 'render', setup: () => {
  const matchMedia = (query) => ({ matches: /pointer:\s*fine/.test(query), media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }); window.matchMedia = globalThis.matchMedia = matchMedia;
  const jsonSchema = { type: 'object', properties: { day: { type: 'string', format: 'date', title: 'Day', presentation: { FieldInputProps: { minimum: '2025-05-10', maximum: '2025-05-20' } } } } }; const defaultValue = { day: '2025-05-15' };
  let container, root, ref, opener;
  return {
    before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve)); opener = [...container.querySelectorAll('button')].find((node) => /^Choose date/.test(node.getAttribute('aria-label') ?? '')); if (!opener) throw new Error('missing date opener'); },
    run: () => flushSync(() => opener.dispatchEvent(new MouseEvent('click', { bubbles: true }))),
    check: () => ref.current.getValue().day === '2025-05-15' && !!document.body.querySelector('[role=grid]'),
    after: () => { root.unmount(); container.remove(); },
  };
} };
