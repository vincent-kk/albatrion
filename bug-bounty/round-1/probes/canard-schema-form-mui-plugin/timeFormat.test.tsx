import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputTimeDefinition } from '../../fieldInputs/FieldInputTime';

type PickerProps = { onChange: (value: Dayjs | null) => void };

const received = vi.hoisted(() => ({ props: [] as PickerProps[] }));

vi.mock('@mui/x-date-pickers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/x-date-pickers')>()),
  TimePicker: (props: PickerProps) => {
    received.props.push(props);
    return null;
  },
}));

afterEach(cleanup);

it('stores time in the README format HH:mm:00Z (offset, zero seconds), like the Ant Design plugins', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputTimeDefinition]}
      jsonSchema={{ type: 'string', format: 'time' }}
      onError={() => {}}
    />,
  );
  const picked = dayjs('2024-03-05T08:09:10');
  act(() => received.props.at(-1)!.onChange(picked));
  expect(ref.current!.getValue()).toBe(picked.format('HH:mm:00Z'));
});
