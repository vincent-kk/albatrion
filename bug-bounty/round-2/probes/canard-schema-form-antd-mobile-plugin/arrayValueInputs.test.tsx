import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

const checkedOf = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  ).map((box) => box.checked);

it('checkbox group shows a same-length value written through FormHandle.setValue', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          checks: {
            type: 'array',
            items: { type: 'string', enum: ['a', 'b', 'c'] },
            presentation: { inputType: 'checkbox' },
          },
        },
      }}
      defaultValue={{ checks: ['a'] }}
    />,
  );
  expect(checkedOf(container)).toEqual([true, false, false]);
  await act(async () => ref.current!.setValue({ checks: ['b'] }));
  expect(ref.current!.getValue()).toEqual({ checks: ['b'] });
  expect(checkedOf(container)).toEqual([false, true, false]);
});

it('range slider shows a same-length value written through FormHandle.setValue', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          span: {
            type: 'array',
            format: 'slider',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
            presentation: { FieldInputProps: { range: true } },
          },
        },
      }}
      defaultValue={{ span: [10, 20] }}
    />,
  );
  const now = () =>
    Array.from(container.querySelectorAll('[role="slider"]')).map((handle) =>
      handle.getAttribute('aria-valuenow'),
    );
  expect(now()).toEqual(['10', '20']);
  await act(async () => ref.current!.setValue({ span: [30, 40] }));
  expect(ref.current!.getValue()).toEqual({ span: [30, 40] });
  expect(now()).toEqual(['30', '40']);
});
