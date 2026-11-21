import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Form } from '@canard/schema-form';
import { FieldInputDateDefinition } from '../FieldInputDate';
import { FieldInputMonthDefinition } from '../FieldInputMonth';
type LockProps = { disabled?: boolean; readOnly?: boolean };
const received = vi.hoisted(() => ({ props: [] as LockProps[] }));
vi.mock('antd', async (original) => ({ ...(await original<typeof import('antd')>()), DatePicker: (props: LockProps) => { received.props.push(props); return null; } }));
afterEach(cleanup);
it.each([
  ['date', FieldInputDateDefinition, 'disabled' as const],
  ['date', FieldInputDateDefinition, 'readOnly' as const],
  ['month', FieldInputMonthDefinition, 'disabled' as const],
  ['month', FieldInputMonthDefinition, 'readOnly' as const],
])('updates %s picker for %s lock', (format, definition, lock) => {
  const schema = { type: 'string' as const, format };
  const view = render(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} />);
  const prop = 'disabled';
  expect(received.props.at(-1)?.[prop] ?? false).toBe(false);
  view.rerender(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} {...{ [lock]: true }} />);
  expect(received.props.at(-1)?.[prop]).toBe(true);
  view.rerender(<Form jsonSchema={schema} fieldInputDefinitions={[definition]} {...{ [lock]: false }} />);
  expect(received.props.at(-1)?.[prop]).toBe(false);
});
