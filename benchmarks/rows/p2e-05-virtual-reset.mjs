import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'virtual reset', input: 'two absent virtual members', inputKind: 'repaired', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' }, note: { type: 'string' } }, options: { virtual: { period: { fields: ['start', 'end'] } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { note: 'n' }, validationMode: ValidationMode.None }, createElement('span'))));
  const period = ref.current.findNode('/period'); if (!period) throw new Error('missing /period'); period.resetSubtree();
  return { run: () => period.resetSubtree(), check: () => JSON.stringify(ref.current.getValue()) === '{"note":"n"}' };
} };
