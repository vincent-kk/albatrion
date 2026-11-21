import { cleanup, render } from '@testing-library/react';
import type { Dayjs } from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';

type PickerProps = {
  minDate?: Dayjs;
  maxDate?: Dayjs;
  shouldDisableDate?: (day: Dayjs) => boolean;
};

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

it('control: pickers receive no limits when none are given', () => {
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

const renderDate = (minimum: string, maximum: string) => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputDateDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'date',
        presentation: { FieldInputProps: { minimum, maximum } },
      }}
    />,
  );
  return received.props.at(-1)!;
};

const renderMonth = (minimum: string, maximum: string) => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputMonthDefinition]}
      jsonSchema={{
        type: 'string',
        format: 'month',
        presentation: { FieldInputProps: { minimum, maximum } },
      }}
    />,
  );
  return received.props.at(-1)!;
};

it('date picker does not apply an overflowing or unparsable limit as a shifted date', () => {
  const props = renderDate('2024-02-31', 'not a date');
  expect(props.minDate).toBeUndefined();
  expect(props.maxDate).toBeUndefined();
  expect(props.shouldDisableDate).toBeUndefined();
});

it('month picker does not apply an overflowing or unparsable limit as a shifted month', () => {
  const props = renderMonth('2024-13', '2024-6');
  expect(props.minDate).toBeUndefined();
  expect(props.maxDate).toBeUndefined();
});

it('control: date picker keeps both boundary days selectable', () => {
  const props = renderDate('2024-03-01', '2024-06-30');
  expect(props.minDate?.format('YYYY-MM-DD')).toBe('2024-03-01');
  expect(props.maxDate?.format('YYYY-MM-DD')).toBe('2024-06-30');
});
