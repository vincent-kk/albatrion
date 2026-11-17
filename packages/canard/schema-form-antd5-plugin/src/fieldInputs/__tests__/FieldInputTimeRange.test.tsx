import type { ComponentProps } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import type { DatePicker as AntdDatePicker } from 'antd';
import dayjs from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, ValidationMode } from '@canard/schema-form';

import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';

type PickerProps = Pick<
  ComponentProps<typeof AntdDatePicker.RangePicker>,
  'disabledTime'
>;

const received = vi.hoisted(() => ({
  props: [] as { widget: string; props: PickerProps }[],
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  const record = (widget: string) => (props: PickerProps) => {
    received.props.push({ widget, props });
    return null;
  };
  return {
    ...actual,
    DatePicker: Object.assign(record('DatePicker'), {
      RangePicker: record('RangePicker'),
    }),
  };
});

const FORMAT = 'HH:mm:00Z';

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

beforeEach(() => {
  received.props.length = 0;
});

afterEach(() => {
  cleanup();
  window.removeEventListener('error', preventWindowError);
});

it('reads minimum and maximum from presentation.FieldInputProps', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputTimeRangeDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          field: {
            type: 'array',
            format: 'time-range',
            items: { type: 'string' },
            presentation: {
              FieldInputProps: {
                minimum: '10:00:00+00:00',
                maximum: '18:00:00+00:00',
              },
            },
          },
        },
      }}
    />,
  );
  const last = received.props.at(-1)!;
  expect(last.widget).toBe('RangePicker');
  const disabledTime = last.props.disabledTime!;
  const isDisabled = (value: string) => {
    const time = dayjs(value, FORMAT);
    const limits = disabledTime(time, 'start', {});
    return (
      !!limits.disabledHours?.().includes(time.hour()) ||
      !!limits.disabledMinutes?.(time.hour()).includes(time.minute())
    );
  };
  expect(isDisabled('09:00:00+00:00')).toBe(true);
  expect(isDisabled('09:59:00+00:00')).toBe(true);
  expect(isDisabled('10:00:00+00:00')).toBe(false);
  expect(isDisabled('12:00:00+00:00')).toBe(false);
  expect(isDisabled('18:00:00+00:00')).toBe(false);
  expect(isDisabled('18:01:00+00:00')).toBe(true);
  expect(isDisabled('19:00:00+00:00')).toBe(true);
});

it('keeps a limit window that wraps past local midnight', () => {
  const local = (hour: number, minute: number) =>
    dayjs().hour(hour).minute(minute).format(FORMAT);
  render(
    <Form
      fieldInputDefinitions={[FieldInputTimeRangeDefinition]}
      jsonSchema={{
        type: 'array',
        format: 'time-range',
        items: { type: 'string' },
        presentation: {
          FieldInputProps: { minimum: local(22, 0), maximum: local(2, 0) },
        },
      }}
    />,
  );
  const limits = received.props.at(-1)!.props.disabledTime!(
    dayjs(),
    'start',
    {},
  );
  expect(limits.disabledHours?.()).toEqual([
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  ]);
  expect(limits.disabledMinutes?.(2)).toEqual(
    Array.from({ length: 59 }, (_, index) => index + 1),
  );
  expect(limits.disabledMinutes?.(23)).toEqual([]);
});

it('accepts minimum under options without a schema error', () => {
  window.addEventListener('error', preventWindowError);
  const onError = vi.fn();
  render(
    <Form
      fieldInputDefinitions={[FieldInputTimeRangeDefinition]}
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: {
          field: {
            type: 'array',
            format: 'time-range',
            items: { type: 'string' },
            options: { minimum: '10:00:00+00:00' },
          },
        },
      }}
    />,
  );
  expect(onError).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).toBeNull();
});
