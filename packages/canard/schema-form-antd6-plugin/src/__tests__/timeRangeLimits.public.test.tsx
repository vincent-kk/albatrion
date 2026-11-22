import type { ComponentProps } from 'react';

import { cleanup, render } from '@testing-library/react';
import type { DatePicker as AntdDatePicker } from 'antd';
import dayjs from 'dayjs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

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

beforeEach(() => {
  received.props.length = 0;
});

afterEach(() => {
  cleanup();
});

it.each([
  {
    minimum: '10:15',
    maximum: '18:30',
    inside: [10, 12, 18],
    outside: [9, 19],
  },
  { minimum: '22:15', maximum: '06:30', inside: [0, 6, 22], outside: [7, 21] },
  { minimum: '22:15', maximum: undefined, inside: [22, 23], outside: [0, 21] },
])(
  'restricts local time between $minimum and $maximum',
  ({ minimum, maximum, inside, outside }) => {
    const withOffset = (time: string) => time + ':00' + dayjs().format('Z');
    render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: 'array',
          format: 'time-range',
          items: { type: 'string' },
          presentation: {
            FieldInputProps: {
              minimum: withOffset(minimum),
              maximum: maximum && withOffset(maximum),
            },
          },
        }}
      />,
    );
    const props = received.props.at(-1)?.props;
    const limits = props?.disabledTime?.(dayjs(), 'start', {});
    const hours = limits?.disabledHours?.();
    for (const hour of inside) expect(hours).not.toContain(hour);
    for (const hour of outside) expect(hours).toContain(hour);
    expect(limits?.disabledMinutes?.(Number(minimum.slice(0, 2)))).toContain(
      14,
    );
    expect(
      limits?.disabledMinutes?.(Number(minimum.slice(0, 2))),
    ).not.toContain(15);
  },
);
