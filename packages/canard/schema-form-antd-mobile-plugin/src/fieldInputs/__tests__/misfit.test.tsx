import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

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

const cases = [
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
] as const;

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
        jsonSchema={jsonSchema as never}
        defaultValue={good as never}
        onError={() => {}}
      />,
    );
    const invalid = () => container.querySelector(INVALID_CONTROL);
    const visible = () => container.querySelector('[role="status"]');
    expect(invalid()).toBeNull();
    expect(visible()).toBeNull();
    act(() => ref.current!.setValue(bad as never));
    expect(invalid()).not.toBeNull();
    expect(visible()?.textContent).toBe('Invalid value');
    act(() => ref.current!.setValue(good as never));
    expect(invalid()).toBeNull();
    expect(visible()).toBeNull();
  },
);
