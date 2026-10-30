import { type ComponentProps, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputMonthRangeDefinition } from '../FieldInputMonthRange';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';

/** Picker callbacks captured by the antd mock to exercise clear and draft events. */
const received = vi.hoisted(() => ({
  single: undefined as ((value: Dayjs | null) => void) | undefined,
  range: undefined as
    | ((value: [Dayjs | null, Dayjs | null] | null) => void)
    | undefined,
}));

// vi.mock replaces the picker exports for this file; callbacks drive the real inputs.
vi.mock('antd', () => ({
  DatePicker: Object.assign(
    (props: { onChange: typeof received.single }) => {
      received.single = props.onChange;
      return null;
    },
    {
      RangePicker: (props: { onChange: typeof received.range }) => {
        received.range = props.onChange;
        return null;
      },
    },
  ),
  TimePicker: (props: { onChange: typeof received.single }) => {
    received.single = props.onChange;
    return null;
  },
}));

beforeEach(() => {
  received.single = undefined;
  received.range = undefined;
});

afterEach(cleanup);

describe.each([
  ['date', FieldInputDateDefinition, '2026-10-26'],
  ['month', FieldInputMonthDefinition, '2026-10'],
  ['time', FieldInputTimeDefinition, '09:30:00+09:00'],
] as const)('%s clear', (format, definition, value) => {
  it.each([false, true])(
    'publishes undefined for null (nullable: %s)',
    (nullable) => {
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
          defaultValue={value}
        />,
      );
      expect(ref.current!.getValue()).toBe(value);
      act(() => received.single!(null));
      expect(ref.current!.getValue()).toBeUndefined();
    },
  );
});

describe.each([
  ['date-range', FieldInputDateRangeDefinition, 'YYYY-MM-DD'],
  ['month-range', FieldInputMonthRangeDefinition, 'YYYY-MM'],
  ['time-range', FieldInputTimeRangeDefinition, 'HH:mm:00Z'],
] as const)('%s events', (format, definition, dateFormat) => {
  it('publishes undefined for null', () => {
    const onChange = vi.fn();
    const FieldInput = definition.Component;
    render(
      <Form
        fieldInputDefinitions={[
          {
            ...definition,
            Component: (props: ComponentProps<typeof FieldInput>) => (
              <FieldInput {...props} onChange={onChange} />
            ),
          },
        ]}
        jsonSchema={{ type: 'array', format, items: { type: 'string' } }}
        defaultValue={['2026-10-26', '2026-10-27']}
      />,
    );
    act(() => received.range!(null));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('withholds half-filled ranges and publishes a formatted full range', () => {
    const ref = createRef<FormHandle>();
    const onChange = vi.fn();
    const start = dayjs('2026-10-26T09:30:00');
    const end = dayjs('2026-10-27T11:45:00');
    const initial = [start.format(dateFormat), end.format(dateFormat)];
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{ type: 'array', format, items: { type: 'string' } }}
        defaultValue={initial}
        onChange={onChange}
      />,
    );
    onChange.mockClear();
    act(() => received.range!([start, null]));
    act(() => received.range!([null, end]));
    expect(onChange).not.toHaveBeenCalled();
    expect(ref.current!.getValue()).toEqual(initial);
    const nextEnd = end.add(1, 'hour').add(1, 'month');
    act(() => received.range!([start, nextEnd]));
    expect(ref.current!.getValue()).toEqual([
      start.format(dateFormat),
      nextEnd.format(dateFormat),
    ]);
    expect(onChange).toHaveBeenLastCalledWith([
      start.format(dateFormat),
      nextEnd.format(dateFormat),
    ]);
  });
});
