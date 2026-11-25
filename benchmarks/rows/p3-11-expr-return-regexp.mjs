import '../dom.mjs';
import { createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

// Candidate only: the baseline cannot build the derived function, so no ratio exists. Run it with --a and --b both set to the candidate tree.
export default { pkg: '@canard/schema-form', fn: 'mount with a regexp after return', input: 'derived expression returning a regexp literal plus a number', inputKind: 'repaired', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { out: { type: 'string', controls: { derived: '{ return /a/ + 0 }' } } } };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, validationMode: ValidationMode.None }, createElement('span')); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => ref.current.getValue()?.out === '/a/0',
    after: () => { root.unmount(); container.remove(); },
  };
} };
