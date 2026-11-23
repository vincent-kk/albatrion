import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, SetValueOption, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'shallow merge', input: 'alternating two-key objects', inputKind: 'plain', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { k0: { type: 'number' }, k1: { type: 'number' } } };
  const values = [{ k0: 0, k1: 1 }, { k0: 1, k1: 2 }]; const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: values[0], validationMode: ValidationMode.None }, createElement('span'))));
  let i = 0;
  return { run: () => { const value = values[i++ & 1]; ref.current.setValue(value, SetValueOption.Merge); return value; }, check: (value) => { const result = ref.current.getValue(); return result.k0 === value.k0 && result.k1 === value.k1; } };
} };
