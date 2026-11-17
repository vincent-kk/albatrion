import { createRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputDateRangeDefinition } from '../FieldInputDateRange';
import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';
import { FieldInputSliderDefinition } from '../FieldInputSlider';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';
import { FieldInputTimeDefinition } from '../FieldInputTime';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('readOnly radio group keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputRadioGroupDefinition]}
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
  await userEvent
    .setup({ pointerEventsCheck: PointerEventsCheckLevel.Never })
    .click(radios[1]);
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
      fieldInputDefinitions={[FieldInputStringCheckboxDefinition]}
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

it('readOnly enum select keeps the displayed selection equal to the stored value', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['alpha', 'beta'] }}
      defaultValue="alpha"
    />,
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const options = document.querySelectorAll('.ant-select-item-option');
  if (options[1]) fireEvent.click(options[1]);
  expect(ref.current!.getValue()).toBe('alpha');
  const root = container.querySelector('.ant-select')!;
  expect(root.textContent).toContain('alpha');
  expect(root.textContent).not.toContain('beta');
});

it('readOnly slider keeps the displayed value equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        minimum: 0,
        maximum: 100,
        presentation: { inputType: 'slider' },
      }}
      defaultValue={10}
    />,
  );
  const handle = container.querySelector<HTMLElement>('[role="slider"]')!;
  fireEvent.keyDown(handle, { key: 'ArrowRight', keyCode: 39, which: 39 });
  fireEvent.keyUp(handle, { key: 'ArrowRight', keyCode: 39, which: 39 });
  await act(async () => {});
  expect(ref.current!.getValue()).toBe(10);
  expect(handle.getAttribute('aria-valuenow')).toBe('10');
});

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
