import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  ValidationMode,
} from '../../index';

const TextControl = ({ inputId, value, onChange }: FieldInputProps<string>) => (
  <input
    id={inputId}
    value={value ?? ''}
    onChange={(event) => onChange(event.target.value)}
  />
);

const ChoiceGroup = ({ labelId, Input }: FieldRendererProps) => (
  <fieldset aria-labelledby={labelId}>
    <legend id={labelId}>Choice</legend>
    <Input />
  </fieldset>
);

const ChoiceControl = ({ inputId, getInputId, value, onChange }: FieldInputProps<string>) => (
  <>
    {['One', 'Two'].map((choice, index) => {
      const optionId = getInputId(index);
      return (
        <label key={choice} htmlFor={optionId}>
          <input
            id={optionId}
            name={inputId}
            type="radio"
            checked={value === choice}
            onChange={() => onChange(choice)}
          />
          {choice}
        </label>
      );
    })}
  </>
);

afterEach(cleanup);
it('connects a custom single control to the bound label using its supplied id', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { text: { type: 'string', title: 'Text' } },
      }}
      validationMode={ValidationMode.None}
      fieldInputDefinitions={[
        { test: { type: 'string' }, Component: TextControl, controlled: true },
      ]}
    />,
  );
  const control = screen.getByRole<HTMLInputElement>('textbox', {
    name: 'text',
  });
  expect(screen.getByText('text').closest('label')?.control).toBe(control);
  fireEvent.change(control, { target: { value: 'edited' } });
  expect(control.value).toBe('edited');
});
it('connects the group title through labelId and each radio through its option id', () => {
  render(
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      FieldRenderer={ChoiceGroup}
      fieldInputDefinitions={[
        {
          test: { type: 'string' },
          Component: ChoiceControl,
          controlled: true,
        },
      ]}
    />,
  );
  const group = screen.getByRole('group', { name: 'Choice' });
  const radios = screen.getAllByRole<HTMLInputElement>('radio');
  expect(group.getAttribute('aria-labelledby')).toBe(
    screen.getByText('Choice').id,
  );
  expect(new Set(radios.map((input) => input.id)).size).toBe(2);
  expect(radios.map((input) => input.labels?.[0].control)).toEqual(radios);
  expect(radios[0].name).toBe(radios[1].name);
  fireEvent.click(radios[1]);
  expect(radios[1].checked).toBe(true);
});
