import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, ValidationMode } from '../../index';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', default: 'n' },
    obj: { type: 'object', properties: { x: { type: 'string' } } },
    list: { type: 'array', items: { type: 'string' }, default: ['a'] },
  },
} as const;

it.for(['/name', '/list/*', '/obj/../name', '/list/0'])(
  'round-2 schema-form 10: Form.Label with absolute query %s labels the input that Form.Input renders for the same query',
  (path) => {
    const view = render(
      <Form jsonSchema={schema} validationMode={ValidationMode.None}>
        <Form.Label path={path} />
        <Form.Input path={path} />
      </Form>,
    );
    const label = view.container.querySelector('label') as HTMLLabelElement;
    const input = view.container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(label.htmlFor).toBe(input.id);
  },
);

it('round-2 schema-form 10: ambiguous and missing queries keep their output', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: { type: 'string' },
            default: ['a', 'b'],
          },
        },
      }}
      validationMode={ValidationMode.None}
    >
      <Form.Label path="/list/*" />
      <Form.Label path="/missing" />
    </Form>,
  );
  expect(view.container.querySelector('label')?.htmlFor).toBe('/list/*');
  expect(view.container.querySelectorAll('label')).toHaveLength(1);
});
