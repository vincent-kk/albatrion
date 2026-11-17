import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputMonthRangeDefinition } from '../FieldInputMonthRange';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';

type LockProps = { disabled?: boolean; readOnly?: boolean };

const received = vi.hoisted(() => ({ props: [] as LockProps[] }));

vi.mock('antd', async (original) => {
  const record = (props: LockProps) => {
    received.props.push(props);
    return null;
  };
  return {
    ...(await original<typeof import('antd')>()),
    TimePicker: record,
    DatePicker: Object.assign(record, { RangePicker: record }),
  };
});

afterEach(cleanup);

it.each([
  ['time', 'disabled' as const, FieldInputTimeDefinition],
  ['time', 'readOnly' as const, FieldInputTimeDefinition],
  ['date-range', 'disabled' as const, FieldInputDateRangeDefinition],
  ['date-range', 'readOnly' as const, FieldInputDateRangeDefinition],
  ['month-range', 'disabled' as const, FieldInputMonthRangeDefinition],
  ['month-range', 'readOnly' as const, FieldInputMonthRangeDefinition],
  ['time-range', 'disabled' as const, FieldInputTimeRangeDefinition],
  ['time-range', 'readOnly' as const, FieldInputTimeRangeDefinition],
])('disables the %s picker for the %s lock', (format, lock, definition) => {
  const schema =
    format === 'time'
      ? { type: 'string' as const, format }
      : { type: 'array' as const, format, items: { type: 'string' as const } };
  const view = render(
    <Form jsonSchema={schema} fieldInputDefinitions={[definition]} />,
  );
  expect(received.props.at(-1)?.disabled ?? false).toBe(false);
  view.rerender(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={[definition]}
      {...{ [lock]: true }}
    />,
  );
  expect(received.props.at(-1)?.disabled).toBe(true);
  view.rerender(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={[definition]}
      {...{ [lock]: false }}
    />,
  );
  expect(received.props.at(-1)?.disabled).toBe(false);
});
