import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

interface PickerCallbacks {
  onChange?: (value: Dayjs | (Dayjs | null)[] | null) => void;
  onPanelChange?: (value: Dayjs | (Dayjs | null)[]) => void;
  onCalendarChange?: (value: Dayjs | (Dayjs | null)[]) => void;
  onPickerValueChange?: (value: Dayjs | (Dayjs | null)[]) => void;
}

const received = vi.hoisted(() => new Map<string, PickerCallbacks>());
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  const DatePicker = (props: PickerCallbacks) => {
    received.set('single', props);
    return null;
  };
  const RangePicker = (props: PickerCallbacks) => {
    received.set('range', props);
    return null;
  };
  return {
    ...actual,
    DatePicker: Object.assign(DatePicker, { RangePicker }),
    TimePicker: DatePicker,
  };
});
afterEach(() => {
  cleanup();
  received.clear();
});

it.each([
  { kind: 'date', format: 'YYYY-MM-DD', action: 'browse' },
  { kind: 'date', format: 'YYYY-MM-DD', action: 'one' },
  { kind: 'date', format: 'YYYY-MM-DD', action: 'both' },
  { kind: 'date', format: 'YYYY-MM-DD', action: 'clear' },
  { kind: 'month', format: 'YYYY-MM', action: 'browse' },
  { kind: 'month', format: 'YYYY-MM', action: 'one' },
  { kind: 'month', format: 'YYYY-MM', action: 'both' },
  { kind: 'month', format: 'YYYY-MM', action: 'clear' },
  { kind: 'time', format: 'HH:mm:00Z', action: 'browse' },
  { kind: 'time', format: 'HH:mm:00Z', action: 'one' },
  { kind: 'time', format: 'HH:mm:00Z', action: 'both' },
  { kind: 'time', format: 'HH:mm:00Z', action: 'clear' },
])(
  'commits selection callbacks consistently for $kind: $action',
  async ({ kind, format, action }) => {
    const single = createRef<FormHandle>();
    const range = createRef<FormHandle>();
    const field: JSONSchema = { type: 'string', format: kind };
    const rangeField: JSONSchema = {
      type: 'array',
      format: `${kind}-range`,
      items: { type: 'string' },
    };
    const previous = dayjs('2024-01-10T09:00:00');
    const start = dayjs('2024-02-12T10:00:00');
    const end = dayjs('2024-03-13T18:00:00');
    render(
      <>
        <Form
          ref={single}
          jsonSchema={field}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          defaultValue={previous.format(format)}
        />
        <Form
          ref={range}
          jsonSchema={rangeField}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          defaultValue={[previous.format(format), previous.format(format)]}
        />
      </>,
    );
    const singleCallbacks = received.get('single');
    const rangeCallbacks = received.get('range');
    if (!singleCallbacks || !rangeCallbacks)
      throw new Error('Picker definitions were not selected');
    await act(async () => {
      if (action === 'browse') {
        singleCallbacks.onPanelChange?.(start);
        singleCallbacks.onCalendarChange?.(start);
        singleCallbacks.onPickerValueChange?.(start);
        rangeCallbacks.onPanelChange?.([start, end]);
        rangeCallbacks.onCalendarChange?.([start, end]);
        rangeCallbacks.onPickerValueChange?.([start, end]);
      } else if (action === 'clear') {
        singleCallbacks.onChange?.(null);
        rangeCallbacks.onChange?.(null);
      } else {
        singleCallbacks.onChange?.(start);
        rangeCallbacks.onCalendarChange?.([
          start,
          action === 'one' ? null : end,
        ]);
        rangeCallbacks.onChange?.([start, action === 'one' ? null : end]);
      }
    });
    const expectedSingle =
      action === 'clear'
        ? undefined
        : action === 'browse'
          ? previous.format(format)
          : start.format(format);
    const expectedRange =
      action === 'clear'
        ? []
        : action === 'both'
          ? [start.format(format), end.format(format)]
          : [previous.format(format), previous.format(format)];
    expect(single.current?.getValue()).toEqual(expectedSingle);
    expect(range.current?.getValue()).toEqual(expectedRange);
  },
);
