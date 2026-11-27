import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

export default { pkg: '@canard/schema-form-mui-plugin', fn: 'slider change', input: 'integer slider, press and release at 70%', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'number', format: 'slider', minimum: 0, maximum: 10, multipleOf: 1, presentation: { inputType: 'slider' } }; const defaultValue = 2;
  let container, root, ref, track;
  return {
    before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve)); track = container.querySelector('.MuiSlider-root'); if (!track) throw new Error('missing slider root'); track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}) }); },
    run: () => flushSync(() => { track.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1, clientX: 70, clientY: 5 })); document.dispatchEvent(new MouseEvent('mouseup', { button: 0, clientX: 70, clientY: 5 })); }),
    check: () => ref.current.getValue() === 7,
    after: () => { root.unmount(); container.remove(); },
  };
} };
