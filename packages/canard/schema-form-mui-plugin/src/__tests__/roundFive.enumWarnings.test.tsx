import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  { name: 'undefined (control)', stored: undefined },
  { name: 'a value outside the enum', stored: 'legacy' },
  { name: 'null without a null option', stored: null },
  { name: 'the string "null" without such an option', stored: 'null' },
])(
  'single enum select stored as $name mounts without out-of-range warnings',
  ({ stored }) => {
    const messages: string[] = [];
    for (const method of ['warn', 'error'] as const)
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        messages.push(args.map(String).join(' '));
      });
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            topic: { type: 'string', enum: ['news', 'sports'], nullable: true },
          },
        }}
        defaultValue={stored === undefined ? {} : { topic: stored }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const outOfRange = messages.filter((message) =>
      message.includes('out-of-range'),
    );
    expect({ outOfRange, value: ref.current!.getValue() }).toEqual({
      outOfRange: [],
      value: stored === undefined ? {} : { topic: stored },
    });
  },
);

it('a value outside the enum is preserved until the user picks, then the pick is stored', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { topic: { type: 'string', enum: ['news', 'sports'] } },
      }}
      defaultValue={{ topic: 'legacy' }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  expect(ref.current!.getValue()).toEqual({ topic: 'legacy' });
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(within(screen.getByRole('listbox')).getByText('news'));
  expect(ref.current!.getValue()).toEqual({ topic: 'news' });
});

it.each(['unknown', 'Alpha'] as const)(
  'preserves the stored enum and displays a later write or reset (DETAIL, initial=%s)',
  async (initial) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            choice: {
              type: 'string',
              enum: ['Alpha', 'Beta'],
              title: 'Choice',
            },
          },
        }}
        defaultValue={{ choice: initial }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />,
    );
    const assertChoice = (value: string) => {
      expect(ref.current!.getValue()).toEqual({ choice: value });
      expect(screen.getByRole('combobox').textContent).toBe(value);
    };
    expect(ref.current!.getValue()).toEqual({ choice: initial });
    fireEvent.mouseDown(screen.getByRole('combobox'));
    if (initial === 'unknown') {
      fireEvent.click(within(screen.getByRole('listbox')).getByText('Alpha'));
      assertChoice('Alpha');
      return;
    }
    await act(async () => ref.current!.setValue({ choice: 'Beta' }));
    assertChoice('Beta');
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await act(async () => ref.current!.reset());
    assertChoice('Alpha');
  },
);
