import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'virtual write', input: 'two active virtual members', inputKind: 'plain', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' }, note: { type: 'string' } }, options: { virtual: { period: { fields: ['start', 'end'] } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { start: 'a', end: 'b', note: 'n' }, validationMode: ValidationMode.None }, createElement('span'))));
  const period = ref.current.findNode('/period'); if (!period) throw new Error('missing /period');
  const values = [['a0', 'b0'], ['a1', 'b1']]; let i = 0;
  return { run: () => { const value = values[i++ % 2]; period.setValue(value); return value; }, check: (value) => { const result = ref.current.getValue(); return result.start === value[0] && result.end === value[1] && result.note === 'n'; } };
} };
