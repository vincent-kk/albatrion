import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajvPlugin } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../../index';

beforeAll(() => {
  registerPlugin(ajvPlugin);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Control for the AJV8 plugin loaded from source: the README slider shapes (`format: 'slider'` on
 * a number and on a numeric array) log an AJV strictTypes warning through the stale AJV8 dist,
 * which predates the plugin's `strict: false` default (d98badc3a). From source they must not.
 */
it.each([
  ['number slider', { type: 'number', format: 'slider', minimum: 0, maximum: 10 }],
  [
    'range slider',
    {
      type: 'array',
      format: 'slider',
      items: { type: 'number', minimum: 0, maximum: 1000 },
    },
  ],
] as [string, JSONSchema][])(
  'the documented %s schema validates with the AJV8 plugin without console warnings',
  async (_, field) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const schema = {
    type: 'object',
    properties: { price: field },
  } satisfies JSONSchema;
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  await act(async () => {
    await ref.current!.validate();
  });
  expect(
    [...warn.mock.calls, ...error.mock.calls]
      .map((call) => String(call[0]))
      .filter((message) => message.includes('strict mode')),
  ).toEqual([]);
  },
);
