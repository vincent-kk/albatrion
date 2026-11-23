import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, isArrayNode, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'structural batch', input: 'push and pop on nested object array', inputKind: 'repaired', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { list: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['a', 'b', 'c'], presentation: { inputType: 'radio' } } } } } } };
  const ref = createRef(); const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: { list: [{ kind: 'a' }, { kind: 'b' }] }, validationMode: ValidationMode.None }, createElement('span'))));
  const list = ref.current.findNode('/list'); const node = ref.current.node; if (!isArrayNode(list) || !node) throw new Error('missing array or root');
  return { run: () => node.batch(() => { list.push({ kind: 'c' }); list.pop(); }), check: () => JSON.stringify(ref.current.getValue()) === '{"list":[{"kind":"a"},{"kind":"b"}]}' };
} };
