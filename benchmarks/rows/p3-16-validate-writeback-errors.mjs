import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'node validate with a rewriting validator that reports errors', input: 'string root whose validator rewrites its value and alternates its issues', inputKind: 'repaired', kind: 'render', setup: () => {
  const issue = { dataPath: '', keyword: 'writeback', message: 'writeback' };
  let container, root, ref, visits;
  const validator = { compile: () => () => { ref.current.node.setValue('same'); return (visits++ & 1) === 0 ? [issue] : []; }, compileGuard: () => () => true };
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); visits = 0; flushSync(() => root.render(createElement(Form, { ref, jsonSchema: { type: 'string' }, defaultValue: 'same', validatorFactory: validator, validationMode: ValidationMode.OnRequest }, createElement('span')))); if (!ref.current?.node) throw new Error('missing root node'); },
    run: () => ref.current.node.validate(),
    check: (result) => Array.isArray(result) && ref.current.getValue() === 'same',
    after: () => { root.unmount(); container.remove(); },
  };
} };
