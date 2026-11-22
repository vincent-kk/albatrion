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
  await userEvent.click(box);
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
  await userEvent.click(radios[1]);
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
  await userEvent.click(boxes[1]);
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(boxes[1].checked).toBe(false);
});

it('boolean checkbox is indeterminate for an undefined value as the README states', () => {
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputBooleanDefinition]}
      jsonSchema={{ type: 'boolean' }}
    />,
  );
  expect(
    container.querySelector('input[type="checkbox"][data-indeterminate="true"]'),
  ).not.toBeNull();
});

it('slider with no value does not display a value the form does not hold', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        minimum: 10,
        maximum: 20,
        presentation: { inputType: 'slider' },
      }}
    />,
  );
  expect(ref.current!.getValue()).toBeUndefined();
  const thumb = container.querySelector<HTMLInputElement>(
    'input[type="range"]',
  )!;
  // The thumb shows 10 although the form value is undefined.
  expect(thumb.getAttribute('aria-valuenow')).toBeNull();
});

it('StringEnum renders a Select for a string array enum as the README states', () => {
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['a', 'b'] },
      }}
    />,
  );
  expect(container.querySelector('[role="combobox"]')).not.toBeNull();
});
