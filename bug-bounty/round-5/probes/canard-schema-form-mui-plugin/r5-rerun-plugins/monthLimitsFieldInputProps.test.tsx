// RG1 neighbor of round 1 MUI item 3 (date and month pickers read limits from
// presentation.FieldInputProps). The round 1 month probe passed limits at schema level, which round 1
// FIXES records as a known limit; this checks the documented FieldInputProps route for the month picker.
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputMonthDefinition } from '../../fieldInputs/FieldInputMonth';

type PickerProps = { minDate?: { format: (f: string) => string }; maxDate?: { format: (f: string) => string } };

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

it('month picker receives limits given through presentation.FieldInputProps', () => {
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
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  expect({
    min: props.minDate?.format('YYYY-MM'),
    max: props.maxDate?.format('YYYY-MM'),
  }).toEqual({ min: '2024-03', max: '2024-06' });
});
