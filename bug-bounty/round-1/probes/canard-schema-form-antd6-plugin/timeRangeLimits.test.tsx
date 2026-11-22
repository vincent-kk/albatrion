import { act, cleanup, fireEvent, render } from '@testing-library/react';
import dayjs from 'dayjs';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputTimeRangeDefinition } from '../../fieldInputs/FieldInputTimeRange';

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as never;
afterEach(cleanup);

it('time-range minimum/maximum limit times, not calendar days', async () => {
  // Build limits in the local offset so the probe is time-zone independent.
  const minimum = dayjs().hour(9).minute(0).format('HH:mm:00Z');
  const maximum = dayjs().hour(18).minute(0).format('HH:mm:00Z');
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputTimeRangeDefinition]}
      jsonSchema={{
        type: 'array',
        format: 'time-range',
        items: { type: 'string' },
        presentation: { FieldInputProps: { minimum, maximum } },
      }}
      onError={() => {}}
    />,
  );
  const input = container.querySelector<HTMLInputElement>('input')!;
  fireEvent.mouseDown(input);
  fireEvent.click(input);
  await act(async () => {});
  const disabledDays = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.ant-picker-date-panel .ant-picker-cell-in-view.ant-picker-cell-disabled',
    ),
  ).map((cell) => cell.getAttribute('title'));
  const today = dayjs().format('YYYY-MM-DD');
  // Selecting today must remain possible: the limits are times of day.
  expect(disabledDays).not.toContain(today);
  const tomorrowPlus = dayjs().add(3, 'day').format('YYYY-MM-DD');
  const allDays = disabledDays.length;
  expect({ allDays, hasFuture: disabledDays.includes(tomorrowPlus) }).toEqual({
    allDays: 0,
    hasFuture: false,
  });
});
