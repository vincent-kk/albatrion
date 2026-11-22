import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);
/** Render a grouped picker using the declared tuple slots. */
const AddressInput = ({ value, onChange }: FieldInputProps) => {
  const tuple = Array.isArray(value) ? value : [];
  return (
    <div>
      <output data-testid="tuple">{JSON.stringify(value)}</output>
      <button
        type="button"
        onClick={() => onChange(['JP', tuple[1], tuple[2]])}
      >
        choose Japan
      </button>
    </div>
  );
};
const schema = {
  type: 'object',
  properties: {
    country: { type: 'string' },
    state: { type: 'string', controls: { active: '../country === "US"' } },
    city: { type: 'string' },
  },
  options: {
    virtual: {
      address: {
        fields: ['country', 'state', 'city'],
        presentation: { FieldInput: AddressInput },
      },
    },
  },
} as const;
type Value = { country?: string; state?: string; city?: string };
it('the grouped widget and native reset preserve physical fields on React 18 and 19', async () => {
  const ref = createRef<FormHandle<typeof schema, Value>>();
  const view = render(
    <Form<typeof schema, Value>
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ country: 'KR', city: 'Seoul' }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(screen.getByTestId('tuple').textContent).toBe('["KR",null,"Seoul"]');
  await act(async () => fireEvent.click(screen.getByText('choose Japan')));
  expect(ref.current?.getValue()).toEqual({ country: 'JP', city: 'Seoul' });
  await act(async () => {
    view.container.querySelector('form')?.reset();
  });
  expect(ref.current?.getValue()).toEqual({ country: 'KR', city: 'Seoul' });
});
