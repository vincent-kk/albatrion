import type { ComponentProps } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import type { DatePicker as AntdDatePicker } from 'antd';
import dayjs from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';

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
  const disabledDate = last.props.disabledDate!;
  const info = { type: 'date' as const };
  expect(disabledDate(dayjs('09:00:00+00:00', FORMAT), info)).toBe(true);
  expect(disabledDate(dayjs('12:00:00+00:00', FORMAT), info)).toBe(false);
  expect(disabledDate(dayjs('19:00:00+00:00', FORMAT), info)).toBe(true);
});

it('rejects minimum under options as UNKNOWN_GROUP_KEY', () => {
  window.addEventListener('error', preventWindowError);
  const onError = vi.fn();
  render(
    <Form
      fieldInputDefinitions={[FieldInputTimeRangeDefinition]}
      onError={onError}
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
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      details: expect.objectContaining({ group: 'options', key: 'minimum' }),
    }),
  );
  expect(screen.getByRole('alert').textContent).toBe('Unable to load form.');
});
