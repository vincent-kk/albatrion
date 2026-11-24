import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'batched array push and pop', input: 'root number array with two items', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'array', items: { type: 'number' } };
  let container, root, ref, node;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue: [1, 2], validationMode: ValidationMode.None }, createElement('span')))); node = ref.current.node; if (!node) throw new Error('missing root node'); },
    run: () => node.batch(() => { node.push(3); node.pop(); }),
    check: () => JSON.stringify(ref.current.getValue()) === '[1,2]',
    after: () => { root.unmount(); container.remove(); },
  };
} };
