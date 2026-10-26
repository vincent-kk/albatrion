import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputBooleanDefinition } from '../FieldInputBoolean';
import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputNumberDefinition } from '../FieldInputNumber';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../FieldInputSlider';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputUriDefinition } from '../FieldInputUri';

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const cases = [
  ['String', FieldInputStringDefinition, { type: 'string' }, { a: 1 }, 'x'],
  ['Number', FieldInputNumberDefinition, { type: 'number' }, 'abc', 7],
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
] as const;

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
    const invalid = () => container.querySelector('[aria-invalid="true"]');
    expect(invalid()).toBeNull();
    act(() => ref.current!.setValue(bad as never));
    expect(invalid()).not.toBeNull();
    act(() => ref.current!.setValue(good as never));
    expect(invalid()).toBeNull();
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
