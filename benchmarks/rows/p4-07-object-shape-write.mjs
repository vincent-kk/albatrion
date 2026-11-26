import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'object leaf write', input: 'one leaf under five nested objects', inputKind: 'plain', kind: 'micro', setup: () => {
  const nest = (inner) => ({ type: 'object', properties: { inner, side: { type: 'string' } } }); const jsonSchema = nest(nest(nest(nest(nest({ type: 'string' })))));
  const wrap = (inner) => ({ inner, side: 's' }); const defaultValue = wrap(wrap(wrap(wrap(wrap('x')))));
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None }, createElement('span'))));
  const leaf = ref.current.findNode('/inner/inner/inner/inner/inner'); if (!leaf) throw new Error('missing leaf'); let i = 0;
  return { run: () => { const value = `v${i++}`; leaf.setValue(value); return value; }, check: (value) => { const result = ref.current.getValue(); return result.inner.inner.inner.inner.inner === value && result.inner.inner.inner.inner.side === 's'; } };
} };
