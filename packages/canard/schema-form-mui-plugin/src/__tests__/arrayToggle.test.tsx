import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
const schema: JSONSchema = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b', 'c'] },
      presentation: { inputType: 'checkbox' },
    },
  },
};
it('a toggle after an external array write matches a fresh mount (round-2 mui-plugin 1)', async () => {
  const ref = createRef<FormHandle>();
  const mounted = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ checks: ['a'] }}
      onError={() => {}}
    />,
  );
  await act(async () => {
    ref.current!.setValue({ checks: ['b'] });
  });
  await act(async () => {
    mounted.container
      .querySelectorAll<HTMLInputElement>('input[type=checkbox]')[2]
      .click();
  });
  const actual = ref.current!.getValue();
  mounted.unmount();
  const fresh = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ checks: ['b'] }}
      onError={() => {}}
    />,
  );
  await act(async () => {
    fresh.container
      .querySelectorAll<HTMLInputElement>('input[type=checkbox]')[2]
      .click();
  });
  expect(ref.current!.getValue()).toEqual({ checks: ['b', 'c'] });
  expect(actual).toEqual(ref.current!.getValue());
});
