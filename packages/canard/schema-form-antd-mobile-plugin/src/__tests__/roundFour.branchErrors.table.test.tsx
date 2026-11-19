import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as validator } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../index';

beforeAll(() => registerPlugin(validator));
afterEach(cleanup);

it.each([
  {
    kind: 'array minimum',
    field: { type: 'array', minItems: 2, items: { type: 'string' } },
    value: ['a'],
  },
  {
    kind: 'array maximum',
    field: { type: 'array', maxItems: 1, items: { type: 'string' } },
    value: ['a', 'b'],
  },
  {
    kind: 'checkbox minimum',
    field: {
      type: 'array',
      minItems: 2,
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    value: ['a'],
  },
  {
    kind: 'checkbox maximum',
    field: {
      type: 'array',
      maxItems: 1,
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
    value: ['a', 'b'],
  },
  {
    kind: 'object minimum',
    field: {
      type: 'object',
      minProperties: 2,
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    },
    value: { a: 'a' },
  },
] satisfies { kind: string; field: JSONSchema; value: unknown }[])(
  '$kind errors are visible as in the core renderer',
  async ({ field, value }) => {
    const schema = {
      type: 'object',
      properties: { field },
    } satisfies JSONSchema;
    const results = [];
    for (const usePlugin of [false, true]) {
      const ref = createRef<FormHandle>();
      const { container, unmount } = render(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue={{ field: value }}
          errorVisibility={ErrorVisibility.Always}
          {...(usePlugin
            ? {
                fieldInputDefinitions: plugin.fieldInputDefinitions,
                FieldRenderer: plugin.FieldRenderer,
                ErrorMessageRenderer: plugin.ErrorMessageRenderer,
              }
            : {})}
        />,
      );
      await act(async () => {
        await ref.current!.validate();
      });
      const messages = ref
        .current!.getErrors()
        .filter((error) => error.dataPath === '/field')
        .map((error) => error.message);
      expect(messages.length).toBeGreaterThan(0);
      results.push(
        messages.map(
          (message) => container.textContent?.includes(message ?? '') ?? false,
        ),
      );
      unmount();
    }
    expect(results[1]).toEqual(results[0]);
    expect(results[0].every(Boolean)).toBe(true);
  },
);
