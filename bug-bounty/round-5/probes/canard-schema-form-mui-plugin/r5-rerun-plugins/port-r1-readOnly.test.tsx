// Port of round 1 `readOnly.test.tsx` (round 1 readOnly selection items). Only the click changed: user-event now
// refuses pointer interaction because the fix renders read-only widgets as antd or MUI `disabled`
// (pointer-events: none), so the port clicks with `pointerEventsCheck: 0` to check the stored and
// displayed values still agree. Tests about the README wording (decided in round 1 FIXES) are left out.
import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputBooleanDefinition } from '../../fieldInputs/FieldInputBoolean';
import { FieldInputRadioGroupDefinition } from '../../fieldInputs/FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../../fieldInputs/FieldInputSlider';
import { FieldInputStringCheckboxDefinition } from '../../fieldInputs/FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from '../../fieldInputs/FieldInputStringEnum';

afterEach(cleanup);

it('readOnly boolean checkbox keeps the displayed state equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputBooleanDefinition]}
      jsonSchema={{ type: 'boolean' }}
      defaultValue={false}
    />,
  );
  const box = container.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  )!;
  await userEvent.setup({ pointerEventsCheck: 0 }).click(box);
  expect(ref.current!.getValue()).toBe(false);
  expect(box.checked).toBe(false);
});

it('readOnly radio group keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputRadioGroupDefinition]}
      jsonSchema={{
        type: 'string',
        enum: ['a', 'b'],
        presentation: { inputType: 'radio' },
      }}
      defaultValue="a"
    />,
  );
  const radios = container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  await userEvent.setup({ pointerEventsCheck: 0 }).click(radios[1]);
  expect(ref.current!.getValue()).toBe('a');
  expect(radios[1].checked).toBe(false);
});

it('readOnly checkbox group keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputStringCheckboxDefinition]}
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['a', 'b'] },
        presentation: { inputType: 'checkbox' },
      }}
      defaultValue={['a']}
    />,
  );
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  await userEvent.setup({ pointerEventsCheck: 0 }).click(boxes[1]);
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(boxes[1].checked).toBe(false);
});
