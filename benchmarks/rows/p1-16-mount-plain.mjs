import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Form, ValidationMode } from '@canard/schema-form';
export default { pkg: '@canard/schema-form', fn: 'Form SSR', input: 'object with string and number', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' } } };
  const defaultValue = { name: 'Ada', count: 3 };
  const element = createElement(Form, { jsonSchema, defaultValue, validationMode: ValidationMode.None });
  renderToString(element);
  return { run: () => renderToString(element), check: (html) => (html.match(/<input/g) || []).length === 2 };
} };
