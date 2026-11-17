import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputMonthRangeDefinition } from '../FieldInputMonthRange';
import { FieldInputTimeDefinition } from '../FieldInputTime';
import { FieldInputTimeRangeDefinition } from '../FieldInputTimeRange';
type LockProps = { disabled?: boolean; readOnly?: boolean };
const received = vi.hoisted(() => ({ props: [] as LockProps[] }));
vi.mock('antd', async (original) => {
  const record = (props: LockProps) => { received.props.push(props); return null; };
  return { ...(await original<typeof import('antd')>()), TimePicker: record, DatePicker: Object.assign(record, { RangePicker: record }) };
});
afterEach(cleanup);
it.each([
  ['date', FieldInputDateDefinition, 'disabled' as const],
  ['date', FieldInputDateDefinition, 'readOnly' as const],
  ['month', FieldInputMonthDefinition, 'disabled' as const],
  ['month', FieldInputMonthDefinition, 'readOnly' as const],
  ['time', FieldInputTimeDefinition, 'disabled' as const],
  ['time', FieldInputTimeDefinition, 'readOnly' as const],
  ['date-range', FieldInputDateRangeDefinition, 'disabled' as const],
  ['date-range', FieldInputDateRangeDefinition, 'readOnly' as const],
  ['month-range', FieldInputMonthRangeDefinition, 'disabled' as const],
  ['month-range', FieldInputMonthRangeDefinition, 'readOnly' as const],
  ['time-range', FieldInputTimeRangeDefinition, 'disabled' as const],
  ['time-range', FieldInputTimeRangeDefinition, 'readOnly' as const],
])('updates %s picker for %s lock', (format, definition, lock) => {
  const schema = format.endsWith('-range')
    ? { type: 'array' as const, format, items: { type: 'string' as const } }
    : { type: 'string' as const, format };
  const view = render(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} />);
  const prop = 'disabled';
  expect(received.props.at(-1)?.[prop] ?? false).toBe(false);
  view.rerender(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} {...{ [lock]: true }} />);
  expect(received.props.at(-1)?.[prop]).toBe(true);
  view.rerender(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} {...{ [lock]: false }} />);
  expect(received.props.at(-1)?.[prop]).toBe(false);
});
