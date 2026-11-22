import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import dayjs, { type Dayjs } from 'dayjs';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

const capture = vi.hoisted(() => ({
  commit: undefined as ((value: Dayjs) => void) | undefined,
}));

vi.mock('@mui/x-date-pickers', async (load) => ({
  ...(await load<typeof import('@mui/x-date-pickers')>()),
  TimePicker: ({ onChange }: { onChange: (value: Dayjs) => void }) => {
    capture.commit = onChange;
    return null;
  },
}));

afterEach(cleanup);

it('stores a selected local time without its date or offset', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', format: 'time' }}
      defaultValue="10:00:00"
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  expect(capture.commit).toBeTypeOf('function');
  act(() => capture.commit?.(dayjs('2024-03-05T08:09:10')));
  expect(ref.current?.getValue()).toBe('08:09:10');
});
