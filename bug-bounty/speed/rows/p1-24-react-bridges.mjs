import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Form, ValidationMode } from '@canard/schema-form';
export default { pkg: '@canard/schema-form', fn: 'Form.Render SSR', input: 'label and input bridge', inputKind: 'plain', kind: 'render', setup: () => {
  const jsonSchema = { type: 'object', properties: { email: { type: 'string', title: 'Email' } } };
  const defaultValue = { email: 'a@example.test' };
  const element = createElement(Form, { jsonSchema, defaultValue, validationMode: ValidationMode.None }, createElement(Form.Render, { path: '/email' }, ({ Label, Input }) => createElement('div', null, createElement(Label), createElement(Input))));
  renderToString(element);
  return { run: () => renderToString(element), check: (html) => html.includes('<label') && html.includes('<input') && html.includes('a@example.test') };
} };
