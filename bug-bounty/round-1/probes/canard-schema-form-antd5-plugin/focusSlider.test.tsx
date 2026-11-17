import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../../fieldInputs/FieldInputSlider';

afterEach(cleanup);

it('focus(path) reaches the slider handle', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
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
      onError={() => {}}
    />,
  );
  await act(async () => {
    ref.current!.focus('/level');
  });
  await act(async () => {});
  const handle = container.querySelector('[role="slider"]');
  expect(handle).not.toBeNull();
  expect(document.activeElement).toBe(handle);
});
