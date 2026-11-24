import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

// Candidate only: no baseline run was validated for this public replacement. Run it with --a and --b both set to the candidate tree.
export default { pkg: '@canard/schema-form', fn: 'relayed own array write', input: 'uncontrolled input publishing a same-content array through a relay', inputKind: 'repaired', kind: 'render', setup: () => {
  let publish; const Whole = ({ defaultValue, onChange }) => { publish = onChange; return createElement('input', { defaultValue: JSON.stringify(defaultValue) }); };
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } }; const ref = createRef();
  const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { list: ['a', 'b'] }, fieldInputMap: { '/list': Whole }, validationMode: ValidationMode.None }, createElement(Form.Render, { path: '/list' }, ({ Input }) => createElement(Input, { onChange: (value) => ref.current.findNode('/list').setValue(value) })))));
  const input = container.querySelector('input'); if (!input || !publish) throw new Error('missing input or publisher');
  return { run: () => flushSync(() => publish(['a', 'b'])), check: () => JSON.stringify(ref.current.getValue().list) === '["a","b"]' && container.querySelector('input') === input };
} };
