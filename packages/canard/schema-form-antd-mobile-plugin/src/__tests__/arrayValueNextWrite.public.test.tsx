import { createRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('a checkbox choice after an external array write extends the written value', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          value: {
            type: 'array',
            items: { type: 'string', enum: ['a', 'b', 'c'] },
            presentation: { inputType: 'checkbox' },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      defaultValue={{ value: ['a'] }}
    />,
  );
  await act(async () => ref.current!.findNode('/value')!.setValue(['b']));
  expect(ref.current!.getValue()).toEqual({ value: ['b'] });
  fireEvent.click(screen.getAllByRole('checkbox')[2]);
  expect(ref.current!.getValue()).toEqual({ value: ['b', 'c'] });
});
