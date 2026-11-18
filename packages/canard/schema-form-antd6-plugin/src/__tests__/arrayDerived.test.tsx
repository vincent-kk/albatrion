import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
const schema: JSONSchema = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    checks: {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
      controls: { derived: '[../source]' },
    },
  },
};
it('derived array writes match a fresh mount of the source (round-2 antd6-plugin 1)', async () => {
  const ref = createRef<FormHandle>();
  const mounted = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ source: 'a' }}
      onError={() => {}}
    />,
  );
  await act(async () => {
    fireEvent.change(
      mounted.container.ownerDocument.getElementById('/source')!,
      { target: { value: 'b' } },
    );
  });
  expect(ref.current!.getValue()).toEqual({ source: 'b', checks: ['b'] });
  const actual = Array.from(
    mounted.container.querySelectorAll<HTMLInputElement>(
      'input[type=checkbox]',
    ),
  ).map((input) => input.checked);
  mounted.unmount();
  const fresh = render(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ source: 'b' }}
      onError={() => {}}
    />,
  );
  const expected = Array.from(
    fresh.container.querySelectorAll<HTMLInputElement>('input[type=checkbox]'),
  ).map((input) => input.checked);
  expect(expected).toEqual([false, true]);
  expect(actual).toEqual(expected);
});
