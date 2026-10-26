import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputTimeDefinition } from '../FieldInputTime';

type PickerProps = { onChange: (value: Dayjs | null) => void };

/** Picker props captured by Vitest's hoisted mock for callback assertions. */
const received = vi.hoisted(() => ({ props: [] as PickerProps[] }));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: PickerProps) => {
    received.props.push(props);
    return null;
  },
}));

vi.mock('@mui/x-date-pickers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/x-date-pickers')>()),
  TimePicker: (props: PickerProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

const cases = [
  [
    'Date',
    FieldInputDateDefinition,
    { type: 'string', format: 'date' },
    '2024-01-01',
    dayjs('2024-03-05'),
    '2024-03-05',
  ],
  [
    'Month',
    FieldInputMonthDefinition,
    { type: 'string', format: 'month' },
    '2024-01',
    dayjs('2024-03-05'),
    '2024-03',
  ],
  [
    'Time',
    FieldInputTimeDefinition,
    { type: 'string', format: 'time' },
    '10:00:00',
    dayjs('2024-03-05T08:09:10'),
    '08:09:10',
  ],
] as const;

it.each(cases)(
  '%s maps null to undefined, skips an invalid Dayjs and formats a valid one',
  (_, definition, jsonSchema, initial, valid, formatted) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={jsonSchema as never}
        defaultValue={initial as never}
        onError={() => {}}
      />,
    );
    const send = (value: Dayjs | null) =>
      act(() => received.props.at(-1)!.onChange(value));

    send(dayjs('not a date'));
    expect(ref.current!.getValue()).toBe(initial);
    send(null);
    expect(ref.current!.getValue()).toBeUndefined();
    send(valid);
    expect(ref.current!.getValue()).toBe(formatted);
  },
);
