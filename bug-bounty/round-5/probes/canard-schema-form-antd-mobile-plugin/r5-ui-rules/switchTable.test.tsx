/**
 * r5-ui-rules string switch table (EQ11): the same schemas and clicks in every UI plugin.
 * Plugin from source, core by name.
 */
import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const isChecked = (control: HTMLElement) =>
  control instanceof HTMLInputElement
    ? control.checked
    : control.getAttribute('aria-checked') === 'true';

it.each([
  {
    name: 'stored value outside the enum',
    field: { type: 'string', enum: ['on', 'off'] },
    stored: 'maybe',
    lock: undefined,
    expected: [false, 'on', true, 'off', false],
  },
  {
    name: 'null as enum[0], unset',
    field: { type: ['string', 'null'], enum: [null, 'off'] },
    stored: undefined,
    lock: undefined,
    expected: [false, null, true, 'off', false],
  },
  {
    name: 'null as enum[1], stored null',
    field: { type: ['string', 'null'], enum: ['on', null] },
    stored: null,
    lock: undefined,
    expected: [false, 'on', true, null, false],
  },
  {
    name: 'read-only form, stored enum[1]',
    field: { type: 'string', enum: ['on', 'off'] },
    stored: 'off',
    lock: 'readOnly',
    expected: [false, 'off', false, 'off', false],
  },
  {
    name: 'disabled form, unset',
    field: { type: 'string', enum: ['on', 'off'] },
    stored: undefined,
    lock: 'disabled',
    expected: [false, undefined, false, undefined, false],
  },
] as const)('$name: [checked, value after click, checked, value after second click, checked]', ({ field, stored, lock, expected }) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={
        {
          type: 'object',
          properties: {
            mode: { ...field, presentation: { inputType: 'switch' } },
          },
        } as JSONSchema
      }
      defaultValue={stored === undefined ? {} : { mode: stored }}
      readOnly={lock === 'readOnly'}
      disabled={lock === 'disabled'}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const value = () => (ref.current!.getValue() as { mode?: unknown }).mode;
  const seen: unknown[] = [isChecked(screen.getByRole('switch'))];
  fireEvent.click(screen.getByRole('switch'));
  seen.push(value(), isChecked(screen.getByRole('switch')));
  fireEvent.click(screen.getByRole('switch'));
  seen.push(value(), isChecked(screen.getByRole('switch')));
  expect(seen).toEqual(expected);
});

it('alias keyed by the display spelling of null labels the null state', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          mode: {
            type: ['string', 'null'],
            enum: [null, 'off'],
            presentation: {
              inputType: 'switch',
              FieldInputProps: { alias: { null: 'Inherit', off: 'Off' } },
            },
          },
        },
      }}
      defaultValue={{ mode: null }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  expect(document.body.textContent).toContain('Inherit');
});
