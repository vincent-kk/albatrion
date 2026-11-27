import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import type { JSONSchema } from '@/schema-form/types';

afterEach(cleanup);

it.each(['items', 'prefixItems'] satisfies readonly (
  | 'items'
  | 'prefixItems'
)[])('%s renders the active candidate kind for an empty UI slot', (keyword) => {
  const jsonSchema: JSONSchema = {
    type: 'object',
    properties: {
      later: { type: 'boolean' },
      rows: {
        type: 'array',
        minItems: 1,
        allOf: [
          {
            controls: { active: '!../later' },
            [keyword]:
              keyword === 'items' ? { type: 'string' } : [{ type: 'string' }],
          },
          {
            controls: { active: '../later' },
            [keyword]:
              keyword === 'items' ? { type: 'number' } : [{ type: 'number' }],
          },
        ],
      },
    },
  };
  const view = render(
    <Form jsonSchema={jsonSchema} defaultValue={{ later: true, rows: [] }} />,
  );
  const slot = () =>
    view.container.querySelector<HTMLInputElement>(
      '[data-path="/rows"] input',
    )!;
  expect(slot().type).toBe('number');
  const toggle = view.container.querySelector<HTMLInputElement>(
    '[data-path="/later"] input',
  )!;
  act(() => fireEvent.click(toggle));
  expect(slot().type).toBe('text');
  act(() => fireEvent.click(toggle));
  expect(slot().type).toBe('number');
  act(() => fireEvent.change(slot(), { target: { value: '42' } }));
  expect(
    view.container.querySelector<HTMLInputElement>(
      '[data-path="/rows/0"] input',
    )?.type,
  ).toBe('number');
  expect(
    view.container.querySelector<HTMLInputElement>(
      '[data-path="/rows/0"] input',
    )?.value,
  ).toBe('42');
});
