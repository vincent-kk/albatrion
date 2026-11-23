import '../dom.mjs';
import '../css.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

export default { pkg: '@canard/schema-form-antd-mobile-plugin', fn: 'slider change', input: 'integer slider, track click at 70%', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'number', format: 'slider', minimum: 0, maximum: 10, multipleOf: 1 }; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: 2, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  const track = container.querySelector('.adm-slider-track'); if (!track) throw new Error('missing slider track'); track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, toJSON: () => ({}) }); Object.defineProperty(track, 'offsetWidth', { value: 100 });
  return { before: () => flushSync(() => ref.current.setValue(2)), run: () => flushSync(() => track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 70, clientY: 5 }))), check: () => ref.current.getValue() === 7 };
} };
