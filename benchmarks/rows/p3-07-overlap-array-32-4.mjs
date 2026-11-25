import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'overlapping array writes', input: 'one trigger writing a 32-item array and its first four items', inputKind: 'repaired', kind: 'micro', setup: () => {
  const injectTo = (value) => { if (typeof value !== 'string') return {}; const effects = { '../list': Array.from({ length: 32 }, (_, index) => value + index) }; for (let index = 0; index < 4; index++) effects[`../list/${index}`] = value + ':' + index; return effects; };
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } }, trigger: { type: 'string', controls: { injectTo } } } };
  const defaultValue = { list: Array.from({ length: 32 }, (_, index) => 'old:' + index) };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None }, createElement('span'))));
  const trigger = ref.current.findNode('/trigger'); if (!trigger) throw new Error('missing trigger'); let i = 0;
  return { run: () => { const version = 'version' + i++; trigger.setValue(version); return version; }, check: (version) => { const list = ref.current.getValue().list; return list.length === 32 && list[0] === version + ':0' && list[3] === version + ':3' && list[4] === version + '4' && list[31] === version + '31'; } };
} };
