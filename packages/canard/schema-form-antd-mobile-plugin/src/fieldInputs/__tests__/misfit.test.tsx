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
import { FieldInputNumberDefinition } from '../FieldInputNumber';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../FieldInputSlider';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';

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
    { a: 1 },
    ['a'],
  ],
  [
    'Slider',
    FieldInputSliderDefinition,
    { type: 'number', format: 'slider' },
    'abc',
    3,
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
    { type: 'number', format: 'slider' },
    { toString: 'oops' },
    3,
  ],
];

const INVALID_CONTROL =
  'input[aria-invalid="true"], textarea[aria-invalid="true"], [role][aria-invalid="true"]';

it.each(cases)(
  '%s marks a misfit value in the DOM and clears it for a valid one',
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
    const invalid = () => container.querySelector(INVALID_CONTROL);
    const control = () =>
      container.querySelector('input, textarea, [role="switch"], .adm-slider');
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
    expect(invalid()).toBeNull();
    act(() => ref.current!.setValue(bad as never));
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(bad);
    expect(invalid()).not.toBeNull();
    act(() => ref.current!.setValue(good as never));
    expect(control()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(good);
    expect(invalid()).toBeNull();
  },
);

const rangeCases: MisfitCase[] = [
  [
    'Range Slider with an uncoercible element',
    FieldInputSliderDefinition,
    {
      type: 'array',
      items: { type: 'number' },
      format: 'slider',
      presentation: { FieldInputProps: { range: true } },
    },
    [1, { toString: 'oops' }],
    [1, 3],
  ],
];

it.each(rangeCases)(
  '%s keeps the input and node value without marking the array parent',
  (_, definition, jsonSchema, bad) => {
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
    const slider = () => container.querySelector('.adm-slider');
    expect(slider()).not.toBeNull();
    expect(ref.current!.getValue()).toEqual(bad);
    expect(container.querySelector(INVALID_CONTROL)).toBeNull();
  },
);

const checkboxElementCases: MisfitCase[] = [
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

it.each(checkboxElementCases)(
  '%s renders both checkboxes unchecked and keeps the node value without throwing',
  (_, definition, jsonSchema, bad) => {
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
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    expect(inputs).toHaveLength(2);
    expect(container.querySelector('input:checked')).toBeNull();
    expect(ref.current!.getValue()).toEqual(bad);
    expect(container.querySelector(INVALID_CONTROL)).toBeNull();
  },
);
