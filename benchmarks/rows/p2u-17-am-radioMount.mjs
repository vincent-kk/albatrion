import '../dom.mjs';
import '../css.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

export default { pkg: '@canard/schema-form-antd-mobile-plugin', fn: 'radio mount', input: 'two-option radio group', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { plan: { type: 'string', title: 'Plan', enum: ['basic', 'plus'], presentation: { inputType: 'radio' } } } }; const defaultValue = { plan: 'basic' };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => { const radios = container.querySelectorAll('.adm-radio'); return ref.current.getValue().plan === 'basic' && radios.length === 2 && radios[0].classList.contains('adm-radio-checked') && !radios[1].classList.contains('adm-radio-checked'); },
    after: () => { root.unmount(); container.remove(); },
  };
} };
