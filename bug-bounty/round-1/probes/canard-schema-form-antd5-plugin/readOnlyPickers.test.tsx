import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputDateRangeDefinition } from '../../fieldInputs/FieldInputDateRange';
import { FieldInputTimeDefinition } from '../../fieldInputs/FieldInputTime';

afterEach(cleanup);

it('readOnly time picker does not let the panel replace the displayed time', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputTimeDefinition]}
      jsonSchema={{ type: 'string', format: 'time' }}
      defaultValue="10:30:00Z"
    />,
  );
  const input = container.querySelector<HTMLInputElement>('input')!;
  const before = input.value;
  fireEvent.mouseDown(input);
  fireEvent.click(input);
  await act(async () => {});
  const cells = document.querySelectorAll<HTMLElement>(
    '.ant-picker-time-panel-column:first-child .ant-picker-time-panel-cell',
  );
  if (cells.length) {
    fireEvent.click(cells[3]);
    const ok = document.querySelector<HTMLElement>('.ant-picker-ok button');
    if (ok) fireEvent.click(ok);
  }
  expect(ref.current!.getValue()).toBe('10:30:00Z');
  expect(input.value).toBe(before);
});

it('readOnly date range picker does not open a selectable calendar', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputDateRangeDefinition]}
      jsonSchema={{
        type: 'array',
        format: 'date-range',
        items: { type: 'string' },
      }}
      defaultValue={['2024-01-10', '2024-01-12']}
    />,
  );
  const input = container.querySelector<HTMLInputElement>('input')!;
  fireEvent.mouseDown(input);
  fireEvent.click(input);
  await act(async () => {});
  const before = input.value;
  const cell = (title: string) =>
    document.querySelector<HTMLElement>(`td[title="${title}"]`);
  if (cell('2024-01-03')) {
    fireEvent.click(cell('2024-01-03')!);
    await act(async () => {});
    fireEvent.click(cell('2024-01-05')!);
    await act(async () => {});
  }
  expect(ref.current!.getValue()).toEqual(['2024-01-10', '2024-01-12']);
  expect(input.value).toBe(before);
});
