import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'Form SSR', input: '100 string fields and default values', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`field${i}`, { type: 'string' }])) }; const defaultValue = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`field${i}`, `value${i}`]));
  const element = createElement(Form, { jsonSchema, defaultValue, validationMode: ValidationMode.None }); renderToString(element);
  return { run: () => renderToString(element), check: (html) => (html.match(/<input/g) || []).length === 100 };
} };
