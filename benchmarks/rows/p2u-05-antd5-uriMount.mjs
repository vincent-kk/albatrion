import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'uri mount', input: 'one-colon scheme address', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { link: { type: 'string', title: 'Link', format: 'uri' } } }; const defaultValue = { link: 'sms:+821012345678' };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => ref.current.getValue().link === 'sms:+821012345678' && !!container.querySelector('.ant-select') && !!container.querySelector('input'),
    after: () => { root.unmount(); container.remove(); },
  };
} };
