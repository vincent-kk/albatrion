import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
import { FieldInputTimeDefinition } from '../FieldInputTime';
type LockProps = { disabled?: boolean; readOnly?: boolean };
const received = vi.hoisted(() => ({ props: [] as LockProps[] }));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: (props: LockProps) => { received.props.push(props); return null; } }));
vi.mock('@mui/x-date-pickers', async (original) => ({ ...(await original<typeof import('@mui/x-date-pickers')>()), TimePicker: (props: LockProps) => { received.props.push(props); return null; } }));
afterEach(cleanup);
it.each([
  ['date', FieldInputDateDefinition, 'disabled' as const],
  ['date', FieldInputDateDefinition, 'readOnly' as const],
  ['month', FieldInputMonthDefinition, 'disabled' as const],
  ['month', FieldInputMonthDefinition, 'readOnly' as const],
  ['time', FieldInputTimeDefinition, 'disabled' as const],
  ['time', FieldInputTimeDefinition, 'readOnly' as const],
])('updates %s picker for %s lock', (format, definition, lock) => {
  const schema = { type: 'string' as const, format };
  const view = render(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} />);
  const prop = lock;
  expect(received.props.at(-1)?.[prop] ?? false).toBe(false);
  view.rerender(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} {...{ [lock]: true }} />);
  expect(received.props.at(-1)?.[prop]).toBe(true);
  view.rerender(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} {...{ [lock]: false }} />);
  expect(received.props.at(-1)?.[prop]).toBe(false);
});
