import type { ComponentProps } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import type { DatePicker as AntdDatePicker } from 'antd';
import dayjs from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';

type PickerProps = Pick<ComponentProps<typeof AntdDatePicker>, 'disabledDate'>;

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

const FORMAT = 'YYYY-MM-DD';

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
      fieldInputDefinitions={[FieldInputDateRangeDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          field: {
            type: 'array',
            format: 'date-range',
            items: { type: 'string' },
            presentation: {
              FieldInputProps: {
                minimum: '2024-01-10',
                maximum: '2024-01-20',
              },
            },
          },
        },
      }}
    />,
  );
  const last = received.props.at(-1)!;
  expect(last.widget).toBe('RangePicker');
  const disabledDate = last.props.disabledDate!;
  const info = { type: 'date' as const };
  expect(disabledDate(dayjs('2024-01-09', FORMAT), info)).toBe(true);
  expect(disabledDate(dayjs('2024-01-15', FORMAT), info)).toBe(false);
  expect(disabledDate(dayjs('2024-01-21', FORMAT), info)).toBe(true);
});

it('rejects minimum under options as UNKNOWN_GROUP_KEY', () => {
  window.addEventListener('error', preventWindowError);
  const onError = vi.fn();
  render(
    <Form
      fieldInputDefinitions={[FieldInputDateRangeDefinition]}
      onError={onError}
      jsonSchema={{
        type: 'object',
        properties: {
          field: {
            type: 'array',
            format: 'date-range',
            items: { type: 'string' },
            options: { minimum: '2024-01-10' },
          },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      details: expect.objectContaining({ group: 'options', key: 'minimum' }),
    }),
  );
  expect(screen.getByRole('alert').textContent).toBe('Unable to load form.');
});
