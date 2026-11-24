import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'validate with a same-value write', input: 'string root whose validator rewrites its own value', inputKind: 'repaired', kind: 'render', setup: () => {
  const ref = createRef();
  const validator = { compile: () => () => { ref.current.findNode('')?.setValue('same'); return []; }, compileGuard: () => () => true };
  const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema: { type: 'string' }, defaultValue: 'same', validatorFactory: validator, validationMode: ValidationMode.OnRequest }, createElement('span'))));
  if (!ref.current?.findNode('')) throw new Error('missing root node');
  return { run: async () => { await ref.current.validate(); flushSync(() => {}); }, check: () => ref.current.getValue() === 'same' };
} };
