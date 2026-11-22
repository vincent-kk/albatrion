import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

/** A disabled MUI control sets `pointer-events: none`; the click must still reach it to prove it is ignored. */
const user = () =>
  userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

it('readOnly boolean checkbox keeps the displayed state equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{ type: 'boolean' }}
      defaultValue={false}
    />,
  );
  const box = container.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  )!;
  await user().click(box);
  expect(ref.current!.getValue()).toBe(false);
  expect(box.checked).toBe(false);
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
  await user().click(radios[1]);
  expect(ref.current!.getValue()).toBe('a');
  expect(radios[1].checked).toBe(false);
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
  await user().click(boxes[1]);
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(boxes[1].checked).toBe(false);
});

it('readOnly slider keeps the displayed value equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'number',
        minimum: 10,
        maximum: 20,
        presentation: { inputType: 'slider' },
      }}
      defaultValue={15}
    />,
  );
  const thumb = container.querySelector<HTMLInputElement>(
    'input[type="range"]',
  )!;
  act(() => thumb.focus());
  await user().keyboard('{End}');
  expect(ref.current!.getValue()).toBe(15);
  expect(thumb.getAttribute('aria-valuenow')).toBe('15');
});
