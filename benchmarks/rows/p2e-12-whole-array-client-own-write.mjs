import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'whole array own write', input: 'uncontrolled two-item whole-array input', inputKind: 'plain', kind: 'render', setup: () => {
  let publish; const Whole = ({ defaultValue, onChange }) => { publish = onChange; return createElement('input', { defaultValue: JSON.stringify(defaultValue), onChange: (event) => onChange([event.target.value]) }); };
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } }; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { list: ['a', 'b'] }, fieldInputMap: { '/list': Whole }, validationMode: ValidationMode.None })));
  const list = ref.current.findNode('/list'); const initialInput = container.querySelector('input'); if (!list || !initialInput || !publish) throw new Error('missing array or input'); let i = 0;
  return { run: () => flushSync(() => publish([String(i++), 'b'])), check: () => { const value = ref.current.getValue(); return value.list[0] === String(i - 1) && value.list[1] === 'b' && container.querySelector('input') === initialInput; } };
} };
