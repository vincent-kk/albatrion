import '../dom.mjs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Form, ValidationMode } from '@canard/schema-form';

export default { pkg: '@canard/schema-form', fn: 'server render with initial errors', input: 'one string field and one server error', inputKind: 'repaired', kind: 'micro', setup: () => {
  const jsonSchema = { type: 'object', properties: { name: { type: 'string', default: 'taken' } } };
  const errors = [{ dataPath: '/name', keyword: 'server', message: 'This name is taken.' }];
  const children = ({ errors: seen }) => createElement('output', null, String(seen?.length ?? 0));
  return { run: () => renderToString(createElement(Form, { jsonSchema, errors, validationMode: ValidationMode.None }, children)), check: (html) => typeof html === 'string' && html.includes('<output>') };
} };
