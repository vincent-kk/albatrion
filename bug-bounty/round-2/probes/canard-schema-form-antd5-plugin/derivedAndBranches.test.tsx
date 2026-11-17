import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

it('derived scalar values reach uncontrolled text, number and radio inputs', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          source: { type: 'string' },
          copy: { type: 'string', controls: { derived: '../source' } },
          size: {
            type: 'number',
            controls: { derived: '(../source ?? "").length' },
          },
          pick: {
            type: 'string',
            enum: ['a', 'ab'],
            presentation: { inputType: 'radio' },
            controls: { derived: '../source' },
          },
        },
      }}
      defaultValue={{ source: 'a' }}
    />,
  );
  const doc = container.ownerDocument;
  fireEvent.change(doc.getElementById('/source')!, { target: { value: 'ab' } });
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({
    source: 'ab',
    copy: 'ab',
    size: 2,
    pick: 'ab',
  });
  expect((doc.getElementById('/copy') as HTMLInputElement).value).toBe('ab');
  expect((doc.getElementById('/size') as HTMLInputElement).value).toBe('2');
  const radios = container.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  expect(radios[1].checked).toBe(true);
});

it('derived array of the same length reaches the checkbox group', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: {
          source: { type: 'string' },
          checks: {
            type: 'array',
            items: { type: 'string', enum: ['a', 'b'] },
            presentation: { inputType: 'checkbox' },
            controls: { derived: '[../source]' },
          },
        },
      }}
      defaultValue={{ source: 'a' }}
    />,
  );
  const doc = container.ownerDocument;
  fireEvent.change(doc.getElementById('/source')!, { target: { value: 'b' } });
  await act(async () => {});
  expect(ref.current!.getValue()).toEqual({ source: 'b', checks: ['b'] });
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  expect([boxes[0].checked, boxes[1].checked]).toEqual([false, true]);
});

it('array insert at the front keeps each uncontrolled item input on its own value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={fieldInputDefinitions}
      jsonSchema={{
        type: 'object',
        properties: { list: { type: 'array', items: { type: 'string' } } },
      }}
      defaultValue={{ list: ['x', 'y'] }}
    />,
  );
  const node = ref.current!.findNode('/list') as any;
  await act(async () => node.insert(0, 'w'));
  await act(async () => node.remove(1));
  expect(ref.current!.getValue()).toEqual({ list: ['w', 'y'] });
  const shown = Array.from(
    container.querySelectorAll<HTMLInputElement>('input'),
  ).map((input) => input.value);
  expect(shown).toEqual(['w', 'y']);
});
