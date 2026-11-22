import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('focus(path) reaches the slider handle', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          level: {
            type: 'number',
            minimum: 0,
            maximum: 10,
            presentation: { inputType: 'slider' },
          },
        },
      }}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      onError={() => {}}
    />,
  );
  await act(async () => {
    ref.current!.focus('/level');
  });
  await act(async () => {});
  const handle = screen.getByRole('slider', { name: 'level' });
  expect(document.activeElement).toBe(handle);
});
