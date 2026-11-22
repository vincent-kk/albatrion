import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('readOnly radio group keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'string',
        enum: ['a', 'b'],
        presentation: { inputType: 'radio' },
      }}
      defaultValue="a"
    />,
  );
  const radios = container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  await userEvent.click(radios[1]);
  expect(ref.current!.getValue()).toBe('a');
  expect(radios[1].checked).toBe(false);
  expect(radios[0].checked).toBe(true);
});

it('readOnly checkbox group keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['a', 'b'] },
        presentation: { inputType: 'checkbox' },
      }}
      defaultValue={['a']}
    />,
  );
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  await userEvent
    .setup({ pointerEventsCheck: PointerEventsCheckLevel.Never })
    .click(boxes[1]);
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(boxes[1].checked).toBe(false);
});

it('readOnly enum select keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{ type: 'string', enum: ['alpha', 'beta'] }}
      defaultValue="alpha"
    />,
  );
  await userEvent.click(container.querySelector('.ant-select-selector')!);
  const option = screen.queryByTitle('beta');
  if (option) await userEvent.click(option);
  expect(ref.current!.getValue()).toBe('alpha');
  expect(
    container.querySelector('.ant-select-selection-item')!.textContent,
  ).toBe('alpha');
});

it('readOnly slider keeps the displayed value equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const field = (readOnly: boolean) => (
    <Form
      ref={ref}
      readOnly={readOnly}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'number',
        minimum: 0,
        maximum: 100,
        presentation: { inputType: 'slider' },
      }}
      defaultValue={10}
    />
  );
  const { rerender } = render(field(false));
  const handle = screen.getByRole('slider');
  expect(handle.getAttribute('aria-disabled')).toBe('false');
  rerender(field(true));
  fireEvent.keyDown(handle, { key: 'ArrowRight', keyCode: 39, which: 39 });
  fireEvent.keyUp(handle, { key: 'ArrowRight', keyCode: 39, which: 39 });
  await act(async () => {});
  expect(ref.current!.getValue()).toBe(10);
  expect(handle.getAttribute('aria-valuenow')).toBe('10');
  expect(handle.getAttribute('aria-disabled')).toBe('true');
});

it('readOnly time picker does not let the panel replace the displayed time', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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

it.each<[string, JSONSchema]>([
  ['checkbox', { type: 'boolean' }],
  ['switch', { type: 'boolean', presentation: { inputType: 'switch' } }],
  [
    'switch',
    {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
  ],
])('locks the native %s control', (role, jsonSchema) => {
  render(
    <Form
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={jsonSchema}
    />,
  );
  expect(screen.getByRole(role)).toHaveProperty('disabled', true);
});

it.each([
  ['month-range', ['2024-01', '2024-04']],
  ['time-range', ['10:30:00Z', '12:30:00Z']],
] as const)(
  'disables both inputs of a read-only %s picker',
  (format, initial) => {
    const view = render(
      <Form
        readOnly
        jsonSchema={{ type: 'array', format, items: { type: 'string' } }}
        defaultValue={[...initial]}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const inputs = Array.from(view.container.querySelectorAll('input'));
    expect(inputs).toHaveLength(2);
    expect(inputs.every((input) => input.disabled)).toBe(true);
  },
);
