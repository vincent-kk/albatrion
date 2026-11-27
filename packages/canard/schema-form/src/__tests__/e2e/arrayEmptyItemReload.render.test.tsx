import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  Form,
  type FormHandle,
  FormWarningCode,
  type JSONSchema,
  ValidationMode,
  isArrayNode,
} from '@/schema-form';

import { createRenderValidator } from '../helpers/createRenderValidator';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Mount a validated form whose errors are always shown, with the default renderer and inputs.
 * @param jsonSchema - Form schema
 * @param defaultValue - First-load value
 * @returns The view and its form handle, after a completed validation
 */
const mountForm = async (jsonSchema: JSONSchema, defaultValue: unknown) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={jsonSchema}
      defaultValue={defaultValue}
      validationMode={ValidationMode.OnChange}
      errorVisibility={ErrorVisibility.Always}
      validatorFactory={createRenderValidator()}
    />,
  );
  const handle = () => {
    if (!ref.current) throw new Error('Expected a form handle');
    return ref.current;
  };
  await act(async () => {
    await handle().validate();
  });
  return { view, handle };
};

/**
 * Read the `/list/1` row of the default renderer: its text input and its error text.
 * @param view - Rendered form
 * @returns The row's input element and the text of the error rendered under it
 */
const secondRow = (view: ReturnType<typeof render>) => {
  const row = view.container.querySelector('[data-path="/list/1"]');
  const input = row?.querySelector('input');
  if (!row || !input) throw new Error('Expected the /list/1 row input');
  return { input, error: row.querySelector('em')?.textContent };
};

/** An object holding a list of required-string items. */
const stringList: JSONSchema = {
  type: 'object',
  properties: { list: { type: 'array', items: { type: 'string' } } },
};

it('reloads a row cleared by typing as the same unmarked row with the same error', async () => {
  const live = await mountForm(stringList, { list: ['x', 'y'] });
  await act(async () => {
    fireEvent.change(secondRow(live.view).input, { target: { value: '' } });
    await live.handle().validate();
  });
  const saved: unknown = JSON.parse(JSON.stringify(live.handle().getValue()));
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const reloaded = await mountForm(stringList, saved);

  expect(saved).toEqual({ list: ['x', null] });
  expect(warn.mock.calls.flat()).not.toContainEqual(
    expect.objectContaining({ code: FormWarningCode.Misfit }),
  );
  const before = secondRow(live.view);
  const after = secondRow(reloaded.view);
  expect(after.input.hasAttribute('aria-invalid')).toBe(false);
  expect(before.input.hasAttribute('aria-invalid')).toBe(false);
  expect(after.error).toBe(before.error);
  expect(after.error).toBeTruthy();
});

it('gives the reloaded empty row the same value and misfit props as the pushed row', async () => {
  const received = new Map<string, Pick<FieldInputProps, 'value' | 'misfit'>>();
  const Probe = ({ path, value, misfit }: FieldInputProps) => {
    received.set(path, { value, misfit });
    return null;
  };
  const probedList: JSONSchema = {
    type: 'object',
    properties: {
      list: {
        type: 'array',
        items: { type: 'string', presentation: { FieldInput: Probe } },
      },
    },
  };
  const live = await mountForm(probedList, { list: ['x'] });
  act(() => {
    const list = live.handle().findNode('/list');
    if (!isArrayNode(list)) throw new Error('Expected the list');
    list.push();
  });
  const pushed = received.get('/list/1');
  const saved: unknown = JSON.parse(JSON.stringify(live.handle().getValue()));
  cleanup();
  received.clear();
  await mountForm(probedList, saved);

  expect(saved).toEqual({ list: ['x', null] });
  expect(pushed).toEqual({ value: undefined, misfit: false });
  expect(received.get('/list/1')).toEqual(pushed);
});

it('keeps an item cleared by typing empty without its default when re-entering through a gate', async () => {
  const gatedList: JSONSchema = {
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      list: {
        type: 'array',
        items: {
          type: 'string',
          default: 'D',
          controls: { active: '../../flag === true' },
        },
      },
    },
  };
  const user = userEvent.setup();
  const live = await mountForm(gatedList, { flag: true, list: ['x', 'y'] });
  await user.clear(secondRow(live.view).input);
  const flagInput = live.view.container.querySelector(
    '[data-path="/flag"] input[type="checkbox"]',
  );
  if (!(flagInput instanceof HTMLInputElement))
    throw new Error('Expected the /flag checkbox');
  await user.click(flagInput);
  await user.click(flagInput);

  expect(secondRow(live.view).input.value).toBe('');
  expect(live.handle().getValue()).toEqual({ flag: true, list: ['x', null] });
});
