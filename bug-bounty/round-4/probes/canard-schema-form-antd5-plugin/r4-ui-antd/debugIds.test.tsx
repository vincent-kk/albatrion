import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

it('diagnostic: prints ids and label targets', () => {
  const { container } = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          'q-1': {
            type: 'string',
            enum: ['yes', 'no', 'maybe'],
            presentation: { inputType: 'radio' },
          },
          'q-1-1': { type: 'string' },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      onError={() => {}}
    />,
  );
  expect(
    JSON.stringify({
      ids: Array.from(container.querySelectorAll('[id]'), (e) => [
        e.tagName,
        e.id,
      ]),
      labels: Array.from(container.querySelectorAll('label'), (e) => [
        e.htmlFor,
        e.textContent,
        e.closest('[data-path]')?.getAttribute('data-path'),
      ]),
    }),
  ).toBe("");
});
