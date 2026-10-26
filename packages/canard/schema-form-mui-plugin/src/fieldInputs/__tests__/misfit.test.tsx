import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputDefinition,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@canard/schema-form';

import { FieldInputBooleanDefinition } from '../FieldInputBoolean';
import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';
import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputNumberDefinition } from '../FieldInputNumber';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../FieldInputSlider';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputUriDefinition } from '../FieldInputUri';

afterEach(cleanup);

type MisfitCase = readonly [
  name: string,
  definition: FieldInputDefinition,
  jsonSchema: JSONSchema,
  bad: unknown,
  good: unknown,
];

const cases: MisfitCase[] = [
  ['String', FieldInputStringDefinition, { type: 'string' }, { a: 1 }, 'x'],
  ['Number', FieldInputNumberDefinition, { type: 'number' }, 'abc', 7],
  [
    'Textarea',
    FieldInputTextareaDefinition,
    { type: 'string', format: 'textarea' },
    { a: 1 },
    'x',
  ],
  [
    'Uri',
    FieldInputUriDefinition,
    { type: 'string', format: 'uri' },
    { a: 1 },
    'https://a.b',
  ],
  [
    'StringEnum',
    FieldInputStringEnumDefinition,
    { type: 'string', enum: ['a', 'b'] },
    { a: 1 },
    'a',
  ],
  [
    'RadioGroup',
    FieldInputRadioGroupDefinition,
    {
      type: 'string',
      enum: ['a', 'b'],
      presentation: { inputType: 'radio' },
    },
    { a: 1 },
    'a',
  ],
  ['Boolean', FieldInputBooleanDefinition, { type: 'boolean' }, { a: 1 }, true],
  [
    'BooleanSwitch',
    FieldInputBooleanSwitchDefinition,
    { type: 'boolean', presentation: { inputType: 'switch' } },
    { a: 1 },
    true,
  ],
  [
    'StringSwitch',
    FieldInputStringSwitchDefinition,
    {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    { a: 1 },
    'on',
  ],
  [
    'StringCheckbox',
    FieldInputStringCheckboxDefinition,
    {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    'ab',
    ['a'],
  ],
  [
    'Slider',
    FieldInputSliderDefinition,
    { type: 'number', presentation: { inputType: 'slider' } },
    'abc',
    5,
  ],
  [
    'Date',
    FieldInputDateDefinition,
    { type: 'string', format: 'date' },
    [2024, 1, 1],
    '2024-01-01',
  ],
  [
    'Month',
    FieldInputMonthDefinition,
    { type: 'string', format: 'month' },
    [2024, 1, 1],
    '2024-01',
  ],
  [
    'Time',
    FieldInputTimeDefinition,
    { type: 'string', format: 'time' },
    ['10:00:00'],
    '10:00:00',
  ],
];

const uncoercibleCases: MisfitCase[] = [
  [
    'String',
    FieldInputStringDefinition,
    { type: 'string' },
    { toString: 'oops' },
    'x',
  ],
  [
    'Number',
    FieldInputNumberDefinition,
    { type: 'number' },
    { toString: 'oops' },
    7,
  ],
  [
    'Textarea',
    FieldInputTextareaDefinition,
    { type: 'string', format: 'textarea' },
    { toString: 'oops' },
    'x',
  ],
  [
    'StringEnum',
    FieldInputStringEnumDefinition,
    { type: 'string', enum: ['a', 'b'] },
    { toString: 'oops' },
    'a',
  ],
  [
    'Date',
    FieldInputDateDefinition,
    { type: 'string', format: 'date' },
    { toString: 'oops' },
    '2024-01-01',
  ],
  [
    'Month',
    FieldInputMonthDefinition,
    { type: 'string', format: 'month' },
    { toString: 'oops' },
    '2024-01',
  ],
  [
    'Time',
    FieldInputTimeDefinition,
    { type: 'string', format: 'time' },
    { toString: 'oops' },
    '10:00:00',
  ],
  [
    'Uri',
    FieldInputUriDefinition,
    { type: 'string', format: 'uri' },
    { toString: 'oops' },
    'https://a.b',
  ],
];

const uncoercibleAriaOnlyCases: MisfitCase[] = [
  [
    'RadioGroup',
    FieldInputRadioGroupDefinition,
    {
      type: 'string',
      enum: ['a', 'b'],
      presentation: { inputType: 'radio' },
    },
    { toString: 'oops' },
    'a',
  ],
  [
    'Boolean',
    FieldInputBooleanDefinition,
    { type: 'boolean' },
    { toString: 'oops' },
    true,
  ],
  [
    'BooleanSwitch',
    FieldInputBooleanSwitchDefinition,
    { type: 'boolean', presentation: { inputType: 'switch' } },
    { toString: 'oops' },
    true,
  ],
  [
    'StringSwitch',
    FieldInputStringSwitchDefinition,
    {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    { toString: 'oops' },
    'on',
  ],
  [
    'StringCheckbox',
    FieldInputStringCheckboxDefinition,
    {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    { toString: 'oops' },
    ['a'],
  ],
  [
    'Slider',
    FieldInputSliderDefinition,
    { type: 'number', presentation: { inputType: 'slider' } },
    { toString: 'oops' },
    5,
  ],
];

const ariaOnlyNames = [
  'RadioGroup',
  'Boolean',
  'BooleanSwitch',
  'StringSwitch',
  'StringCheckbox',
  'Slider',
];

it.each([...cases, ...uncoercibleAriaOnlyCases])(
  '%s marks a misfit value with aria-invalid and clears it for a valid one',
  (name, definition, jsonSchema, bad, good) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={jsonSchema}
        defaultValue={good as never}
        onError={() => {}}
      />,
    );
    const invalid = () =>
      container.querySelector(
        'input:not([aria-hidden="true"])[aria-invalid="true"], textarea[aria-invalid="true"], [role][aria-invalid="true"]',
      );
    const supportsError = !ariaOnlyNames.includes(name);
    const visible = () => container.querySelector('.Mui-error');
    expect(invalid()).toBeNull();
    expect(visible()).toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
    act(() => ref.current!.setValue(bad as never));
    expect(invalid()).not.toBeNull();
    if (supportsError) {
      expect(visible()).not.toBeNull();
    } else {
      expect(visible()).toBeNull();
    }
    expect(ref.current!.getValue()).toEqual(bad);
    act(() => ref.current!.setValue(good as never));
    expect(invalid()).toBeNull();
    expect(visible()).toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
  },
);

it.each(uncoercibleCases)(
  '%s renders an uncoercible object without throwing, sets aria-invalid="true" and .Mui-error, clears them on a valid value, and keeps the node value intact',
  (_, definition, jsonSchema, bad, good) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={jsonSchema}
        defaultValue={bad as never}
        onError={() => {}}
      />,
    );
    const invalid = () =>
      container.querySelector(
        'input:not([aria-hidden="true"])[aria-invalid="true"], textarea[aria-invalid="true"], [role][aria-invalid="true"]',
      );
    const muiError = () => container.querySelector('.Mui-error');
    expect(invalid()).not.toBeNull();
    expect(muiError()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(bad);
    act(() => ref.current!.setValue(good as never));
    expect(invalid()).toBeNull();
    expect(muiError()).toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
  },
);

it('StringCheckbox with an uncoercible element renders both checkboxes unchecked and keeps the node value without throwing', () => {
  const ref = createRef<FormHandle>();
  const bad = ['a', { toString: 'oops' }];
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringCheckboxDefinition]}
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['a', 'b'] },
        presentation: { inputType: 'checkbox' },
      }}
      defaultValue={bad as never}
      onError={() => {}}
    />,
  );
  expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
  expect(container.querySelector('input:checked')).toBeNull();
  expect(ref.current!.getValue()).toEqual(bad);
  expect(container.querySelector('.Mui-error')).toBeNull();
});

it('puts aria-invalid on the text input of a TextField', () => {
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputStringDefinition]}
      jsonSchema={{ type: 'string' }}
      defaultValue={{ a: 1 } as never}
      onError={() => {}}
    />,
  );
  expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe(
    'true',
  );
});
