// Vitest hoists this file-local antd mock; received captures picker callbacks.
import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputMonthRangeDefinition } from '../FieldInputMonthRange';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';

/** Latest picker props, isolated from real picker UI and other test files. */
const received = vi.hoisted(() => ({
  date: undefined as DatePickerProps | undefined,
  time: undefined as TimePickerProps | undefined,
  range: undefined as RangePickerProps | undefined,
}));

vi.mock('antd', () => ({
  DatePicker: Object.assign(
    (props: DatePickerProps) => {
      received.date = props;
      return null;
    },
    {
      RangePicker: (props: RangePickerProps) => {
        received.range = props;
        return null;
      },
    },
  ),
  TimePicker: (props: TimePickerProps) => {
    received.time = props;
    return null;
  },
}));

beforeEach(() => {
  received.date = undefined;
  received.time = undefined;
  received.range = undefined;
});
afterEach(cleanup);

it.each([
  ['date', FieldInputDateDefinition, false],
  ['date', FieldInputDateDefinition, true],
  ['month', FieldInputMonthDefinition, false],
  ['month', FieldInputMonthDefinition, true],
  ['time', FieldInputTimeDefinition, false],
  ['time', FieldInputTimeDefinition, true],
] as const)(
  '%s publishes undefined when cleared (case %#)',
  (format, definition, nullable) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{
          type: nullable ? ['string', 'null'] : 'string',
          format,
          options: { omitEmpty: false },
        }}
        defaultValue="2026-10-20T09:30:00+09:00"
        onError={() => {}}
      />,
    );
    expect(ref.current!.getValue()).toBe('2026-10-20T09:30:00+09:00');
    act(() => {
      const props = format === 'time' ? received.time! : received.date!;
      // Antd 5 types omit the null emitted by its clear action.
      const clear = props.onChange as (
        value: Dayjs | null,
        text: string,
      ) => void;
      clear(null, '');
    });
    expect(ref.current!.getValue()).toBeUndefined();
  },
);

it.each([
  ['date', FieldInputDateDefinition, 'YYYY-MM-DD'],
  ['month', FieldInputMonthDefinition, 'YYYY-MM'],
  ['time', FieldInputTimeDefinition, 'HH:mm:00Z'],
] as const)(
  '%s keeps publishing formatted selections',
  (format, definition, pattern) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{ type: 'string', format }}
        onError={() => {}}
      />,
    );
    const selected = dayjs('2026-10-20T09:30:00+09:00');
    act(() => {
      const props = format === 'time' ? received.time! : received.date!;
      props.onChange!(selected, selected.format(pattern));
    });
    expect(ref.current!.getValue()).toBe(selected.format(pattern));
  },
);

it.each([
  ['date-range', FieldInputDateRangeDefinition, 'YYYY-MM-DD', false],
  ['date-range', FieldInputDateRangeDefinition, 'YYYY-MM-DD', true],
  ['month-range', FieldInputMonthRangeDefinition, 'YYYY-MM', false],
  ['month-range', FieldInputMonthRangeDefinition, 'YYYY-MM', true],
  ['time-range', FieldInputTimeRangeDefinition, 'HH:mm:00Z', false],
  ['time-range', FieldInputTimeRangeDefinition, 'HH:mm:00Z', true],
] as const)(
  '%s withholds half ranges, formats complete ranges and clears to undefined (case %#)',
  (format, definition, pattern, nullable) => {
    const ref = createRef<FormHandle>();
    const initial = ['2026-01-01', '2026-01-02'];
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{
          type: 'object',
          options: { omitEmpty: false },
          properties: {
            range: {
              type: nullable ? ['array', 'null'] : 'array',
              format,
              items: { type: 'string' },
            },
          },
        }}
        defaultValue={{ range: initial }}
        onError={() => {}}
      />,
    );
    const start = dayjs('2026-10-20T09:30:00+09:00');
    const end = dayjs('2026-11-21T12:45:00+09:00');
    act(() => received.range!.onChange!([start, null], ['', '']));
    expect(ref.current!.getValue()).toEqual({ range: initial });
    act(() => received.range!.onChange!([null, end], ['', '']));
    expect(ref.current!.getValue()).toEqual({ range: initial });
    const formatted: [string, string] = [
      start.format(pattern),
      end.format(pattern),
    ];
    act(() => received.range!.onChange!([start, end], formatted));
    expect(ref.current!.getValue()).toEqual({ range: formatted });
    act(() => received.range!.onChange!(null, ['', '']));
    expect(ref.current!.getValue()).toEqual({ range: undefined });
  },
);
