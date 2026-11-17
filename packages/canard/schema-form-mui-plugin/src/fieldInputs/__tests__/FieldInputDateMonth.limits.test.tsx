import { cleanup, render } from '@testing-library/react';
import type { Dayjs } from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';

type PickerProps = { minDate?: Dayjs; maxDate?: Dayjs };

/** DatePicker props captured by Vitest's hoisted mock for limit assertions. */
const received = vi.hoisted(() => ({ props: [] as PickerProps[] }));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: PickerProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

it('date picker reads minimum and maximum from presentation.FieldInputProps', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputDateDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'date',
        presentation: {
          FieldInputProps: { minimum: '2024-03-01', maximum: '2024-06-30' },
        },
      }}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.minDate?.format('YYYY-MM-DD')).toBe('2024-03-01');
  expect(props.maxDate?.format('YYYY-MM-DD')).toBe('2024-06-30');
});

it('month picker reads minimum and maximum from presentation.FieldInputProps', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputMonthDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'month',
        presentation: {
          FieldInputProps: { minimum: '2024-03', maximum: '2024-06' },
        },
      }}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.minDate?.format('YYYY-MM')).toBe('2024-03');
  expect(props.maxDate?.format('YYYY-MM')).toBe('2024-06');
});

it('pickers receive no limits when none are given', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputMonthDefinition]}
      jsonSchema={{ type: 'string', format: 'month' }}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.minDate).toBeUndefined();
  expect(props.maxDate).toBeUndefined();
});
