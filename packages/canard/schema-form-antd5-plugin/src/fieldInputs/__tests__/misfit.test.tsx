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
import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputMonthRangeDefinition } from '../FieldInputMonthRange';
import { FieldInputNumberDefinition } from '../FieldInputNumber';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../FieldInputSlider';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';
import { FieldInputUnionDefinition } from '../FieldInputUnion';
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
    'Union',
    FieldInputUnionDefinition,
    { type: ['number', 'boolean'] },
    'abc',
    7,
  ],
  [
    'StringEnum',
    FieldInputStringEnumDefinition,
    { type: 'string', enum: ['a', 'b'] },
    { a: 1 },
    'a',
  ],
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
    'Date',
    FieldInputDateDefinition,
    { type: 'string', format: 'date' },
    { a: 1 },
    '2024-01-01',
  ],
  [
    'Month',
    FieldInputMonthDefinition,
    { type: 'string', format: 'month' },
    { a: 1 },
    '2024-01-01',
  ],
  [
    'Time',
    FieldInputTimeDefinition,
    { type: 'string', format: 'time' },
    { a: 1 },
    '10:00:00Z',
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
    'Slider',
    FieldInputSliderDefinition,
    { type: 'number', presentation: { inputType: 'slider' } },
    'abc',
    3,
  ],
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
    'DateRange',
    FieldInputDateRangeDefinition,
    { type: 'array', format: 'date-range', items: { type: 'string' } },
    'ab',
    [],
  ],
  [
    'MonthRange',
    FieldInputMonthRangeDefinition,
    { type: 'array', format: 'month-range', items: { type: 'string' } },
    'ab',
    [],
  ],
  [
    'TimeRange',
    FieldInputTimeRangeDefinition,
    { type: 'array', format: 'time-range', items: { type: 'string' } },
    'ab',
    [],
  ],
  [
    'String with an uncoercible object',
    FieldInputStringDefinition,
    { type: 'string' },
    { toString: 'oops' },
    'x',
  ],
  [
    'Number with an uncoercible object',
    FieldInputNumberDefinition,
    { type: 'number' },
    { toString: 'oops' },
    7,
  ],
  [
    'Slider with an uncoercible object',
    FieldInputSliderDefinition,
    { type: 'number', presentation: { inputType: 'slider' } },
    { toString: 'oops' },
    3,
  ],
  [
    'Textarea with an uncoercible object',
    FieldInputTextareaDefinition,
    { type: 'string', format: 'textarea' },
    { toString: 'oops' },
    'x',
  ],
  [
    'StringEnum with an uncoercible object',
    FieldInputStringEnumDefinition,
    { type: 'string', enum: ['a', 'b'] },
    { toString: 'oops' },
    'a',
  ],
];

it.each(cases)(
  '%s marks a misfit value in the DOM and clears it for a valid one',
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
        'input[aria-invalid="true"], textarea[aria-invalid="true"], [role][aria-invalid="true"]',
      );
    const supportsErrorStatus = ![
      'RadioGroup',
      'Boolean',
      'Slider',
      'BooleanSwitch',
      'StringSwitch',
      'StringCheckbox',
      'Slider with an uncoercible object',
    ].includes(name);
    const errorStatus = () =>
      container.querySelector('[class*="-status-error"]');
    const control = () =>
      container.querySelector(
        'input, textarea, [role="switch"], [role="slider"]',
      );
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
    expect(invalid()).toBeNull();
    if (supportsErrorStatus) expect(errorStatus()).toBeNull();
    act(() => ref.current!.setValue(bad as never));
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(bad);
    expect(invalid()).not.toBeNull();
    if (supportsErrorStatus) expect(errorStatus()).not.toBeNull();
    act(() => ref.current!.setValue(good as never));
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
    expect(invalid()).toBeNull();
    if (supportsErrorStatus) expect(errorStatus()).toBeNull();
  },
);

const arrayCases: MisfitCase[] = [
  [
    'StringEnum with an uncoercible element',
    FieldInputStringEnumDefinition,
    { type: 'array', items: { type: 'string', enum: ['a', 'b'] } },
    ['a', { toString: 'oops' }],
    ['a'],
  ],
  [
    'StringCheckbox with an uncoercible element',
    FieldInputStringCheckboxDefinition,
    {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    ['a', { toString: 'oops' }],
    ['a'],
  ],
];

it.each(arrayCases)(
  '%s keeps the input and node value without marking the array parent',
  (_, definition, jsonSchema, bad, good) => {
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
    const control = () => container.querySelector('input');
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
    act(() => ref.current!.setValue(bad as never));
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(bad);
    expect(
      container.querySelector('input:checked, .ant-select-selection-item'),
    ).toBeNull();
    expect(container.querySelector('[aria-invalid="true"]')).toBeNull();
    expect(container.querySelector('[class*="-status-error"]')).toBeNull();
    act(() => ref.current!.setValue(good as never));
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
  },
);

it('Uri renders an object value without throwing and shows the error status', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputUriDefinition]}
      jsonSchema={{ type: 'string', format: 'uri' }}
      defaultValue={{ a: 1 } as never}
      onError={() => {}}
    />,
  );
  const input = container.querySelector('input[type="text"]');
  expect(input).not.toBeNull();
  expect(container.querySelector('.ant-input-status-error')).not.toBeNull();
  act(() => ref.current!.setValue('https://a.b'));
  expect(container.querySelector('.ant-input-status-error')).toBeNull();
});
