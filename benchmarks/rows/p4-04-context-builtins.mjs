import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Form, ValidationMode } from '@canard/schema-form';

/**
 * Builds a context holding built-ins: a `Map` of 4 entries, a `Set` of 4 numbers, a `Date`, a `RegExp` and a nested plain object.
 * @returns a fresh context whose content equals every other result, so the comparison reads each built-in and finds them equal
 */
const context = () => ({ lookup: new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]), ids: new Set([1, 2, 3, 4]), since: new Date(1700000000000), pattern: /^a+b$/gi, session: { role: 'viewer' } });

export default { pkg: '@canard/schema-form', fn: 'Form context update', input: 'fresh context of built-ins with equal content', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { name: { type: 'string' } } }; const defaultValue = { name: 'Ada' }; const tree = () => createElement(Form, { jsonSchema, defaultValue, context: context(), validationMode: ValidationMode.None }); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(tree()));
  return { run: () => flushSync(() => root.render(tree())), check: () => container.querySelector('input')?.value === 'Ada' };
} };
