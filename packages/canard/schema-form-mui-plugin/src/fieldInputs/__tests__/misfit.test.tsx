import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputBooleanDefinition } from '../FieldInputBoolean';
import { FieldInputNumberDefinition } from '../FieldInputNumber';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputUriDefinition } from '../FieldInputUri';

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
] as const;

it.each(cases)(
  '%s marks a misfit value with aria-invalid and clears it for a valid one',
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

it('puts aria-invalid on the text input of a TextField', () => {
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputStringDefinition]}
      jsonSchema={{ type: 'string' }}
      defaultValue={{ a: 1 } as never}
      onError={() => {}}
    />,
  );
  expect(
    container.querySelector('input')!.getAttribute('aria-invalid'),
  ).toBe('true');
});
