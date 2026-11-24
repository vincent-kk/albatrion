import '../dom.mjs';
import '../css.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// The plugin's Slider is uncontrolled (defaultValue only): a second click at the same position finds the internal value already 7 and emits nothing, so every operation mounts a fresh form untimed.
export default { pkg: '@canard/schema-form-antd-mobile-plugin', fn: 'slider change', input: 'integer slider, track click at 70%', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'number', format: 'slider', minimum: 0, maximum: 10, multipleOf: 1 };
  let container, root, ref, track;
  return {
    before: () => {
      container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef();
      flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: 2, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
      track = container.querySelector('.adm-slider-track'); if (!track) throw new Error('missing slider track');
      track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}) }); Object.defineProperty(track, 'offsetWidth', { value: 100 });
    },
    run: () => flushSync(() => track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 70, clientY: 5 }))),
    check: () => ref.current.getValue() === 7,
    after: () => { root.unmount(); container.remove(); },
  };
} };
