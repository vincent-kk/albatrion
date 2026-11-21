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
  const limits = last.props.disabledTime?.(
    dayjs('12:00:00+00:00', FORMAT),
    'start',
    {},
  );
  const hours = limits?.disabledHours?.();
  const localHour = (hour: string) =>
    dayjs(hour + ':00:00+00:00', FORMAT).hour();
  expect(hours).toContain(localHour('09'));
  expect(hours).not.toContain(localHour('12'));
  expect(hours).toContain(localHour('19'));
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
