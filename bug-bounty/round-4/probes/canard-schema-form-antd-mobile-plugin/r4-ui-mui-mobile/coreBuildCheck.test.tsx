import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/**
 * Control: proves this run loaded @canard/schema-form from source. It passes through the probe
 * folder's vitest.config.ts and fails against the stale dist, which predates 633ef8c8e
 * (round-3 schema-form 1 and 6) and passes no `FieldInputProps.id` to inputs.
 */
it('control: the core loaded from source passes the Form-scoped FieldInputProps.id to inputs', () => {
  const { container } = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          one: {
            type: 'string',
            enum: ['a', 'b'],
            presentation: { inputType: 'radio' },
          },
        },
      }}
      defaultValue={{ one: 'a' }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  const radios = Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type=radio]'),
  ).map((input) => [input.name.replace(/^.*?:/, ''), input.id.replace(/^.*?:/, '')]);
  expect(radios).toEqual([
    ['/one', '/one-0'],
    ['/one', '/one-1'],
  ]);
});
