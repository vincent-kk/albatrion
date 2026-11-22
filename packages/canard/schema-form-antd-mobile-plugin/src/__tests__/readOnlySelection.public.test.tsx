import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const user = userEvent.setup({
  pointerEventsCheck: PointerEventsCheckLevel.Never,
});

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
  await user.click(radios[1]);
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
  await user.click(boxes[1]);
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(boxes[1].checked).toBe(false);
  expect(boxes[0].checked).toBe(true);
});

it('readOnly slider keeps the displayed value equal to the stored value', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'number',
        format: 'slider',
        minimum: 0,
        maximum: 100,
      }}
      defaultValue={10}
    />,
  );
  const thumb = container.querySelector<HTMLElement>('[role="slider"]')!;
  fireEvent.click(container.querySelector('.adm-slider-track')!, {
    clientX: 50,
  });
  await act(async () => {});
  expect(ref.current!.getValue()).toBe(10);
  expect(thumb.getAttribute('aria-valuenow')).toBe('10');
});
