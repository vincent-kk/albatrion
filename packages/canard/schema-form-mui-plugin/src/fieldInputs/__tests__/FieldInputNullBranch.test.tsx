import { createRef } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputArrayDefinition } from '../FieldInputArray';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';

afterEach(cleanup);

/** A nullable array node with no value reports `null`; these inputs must treat it as empty. */
const hasNullToken = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input')).some(
    (input) => input.value === 'null' || input.value === '"null"',
  ) || container.textContent!.includes('null');

it('control: a checkbox group with a null value renders empty and its first change stores an array', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringCheckboxDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          tags: {
            type: ['array', 'null'],
            items: { type: 'string', enum: ['a', 'b'] },
            presentation: { inputType: 'checkbox' },
          },
        },
      }}
      defaultValue={{ tags: null }}
    />,
  );
  expect(ref.current!.getValue()).toEqual({ tags: null });
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  expect(boxes).toHaveLength(2);
  expect(Array.from(boxes).some((box) => box.checked)).toBe(false);
  expect(hasNullToken(container)).toBe(false);

  await userEvent.click(boxes[0]);
  expect(ref.current!.getValue()).toEqual({ tags: ['a'] });
});

it('control: an array input with a null value renders no items and its first add stores an array', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[
        FieldInputArrayDefinition,
        FieldInputStringDefinition,
      ]}
      jsonSchema={{
        type: 'object',
        properties: {
          names: { type: ['array', 'null'], items: { type: 'string' } },
        },
      }}
      defaultValue={{ names: null }}
    />,
  );
  expect(ref.current!.getValue()).toEqual({ names: null });
  expect(container.querySelectorAll('input')).toHaveLength(0);
  expect(hasNullToken(container)).toBe(false);

  await userEvent.click(screen.getByTitle('add'));
  const value = ref.current!.getValue();
  expect(Array.isArray(value.names)).toBe(true);
  expect(value.names).toHaveLength(1);
});
