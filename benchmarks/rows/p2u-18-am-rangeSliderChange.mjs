import '../dom.mjs';
import '../css.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

export default { pkg: '@canard/schema-form-antd-mobile-plugin', fn: 'range slider change', input: 'two-thumb slider, track click at 70%', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'array', format: 'slider', minimum: 0, maximum: 100, multipleOf: 1, items: { type: 'number', minimum: 0, maximum: 80, multipleOf: 1 }, presentation: { FieldInputProps: { range: true } } }; const defaultValue = [10, 30];
  let container, root, ref, track;
  return {
    before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve)); track = container.querySelector('.adm-slider-track'); if (!track) throw new Error('missing slider track'); track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}) }); Object.defineProperty(track, 'offsetWidth', { value: 100 }); },
    run: () => flushSync(() => track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 70, clientY: 5 }))),
    check: () => { const value = ref.current.getValue(); return value.length === 2 && value[0] === 10 && value[1] > 30; },
    after: () => { root.unmount(); container.remove(); },
  };
} };
