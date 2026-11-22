import { cleanup, render } from '@testing-library/react';
import type { Dayjs } from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

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
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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

it('uses the schema date limit when the public definition receives it directly', () => {
  const jsonSchema = {
    type: 'string',
    format: 'date',
    minimum: '2024-04-01',
  } as const;
  const date = plugin.fieldInputDefinitions.find(
    ({ test }) =>
      typeof test === 'function' &&
      test({
        type: 'string',
        schemaType: 'string',
        format: 'date',
        path: '/day',
        misfit: false,
        nullable: false,
        required: false,
        jsonSchema: { type: 'string', format: 'date' },
      }),
  );
  if (!date) throw new Error('The plugin must expose a date input');
  const DateInput = date.Component;
  render(
    <DateInput
      inputId="date"
      labelId="date-label"
      getInputId={(key: string | number) => 'date-' + key}
      jsonSchema={jsonSchema}
      name="day"
      context={{}}
    />,
  );
  expect(received.props.at(-1)?.minDate?.format('YYYY-MM-DD')).toBe(
    '2024-04-01',
  );
});
