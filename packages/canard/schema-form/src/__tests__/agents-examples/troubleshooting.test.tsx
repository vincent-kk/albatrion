import { type FC } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type FieldInputProps, Form, FormErrorCode } from '@/schema-form';

/** Marker input mapped by path.
 * @returns A field marked for lookup. */
const ItemNameInput: FC<FieldInputProps<string>> = () => (
  <input data-testid="item-name-input" />
);

/** Branch array input that lays out the item inputs.
 * @param props - FieldInput props supplied by Form.
 * @returns One slot per item node. */
const ItemsLayout: FC<FieldInputProps> = ({ ChildFields }) => (
  <div>
    {ChildFields.map((Child, index) => (
      <Child key={index} />
    ))}
  </div>
);

// prettier-ignore
const mapProps = {
fieldInputMap: {
  '/items/*/name': ItemNameInput,   // ✅
  '/items/**/name': ItemNameInput,  // ❌ invalid pattern: form stays in fallback
}
}

const itemsSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    },
  },
} as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('rejects a map whose ** pattern cannot compile as a load configuration error', async () => {
  const onError = vi.fn();
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  render(
    <Form
      jsonSchema={itemsSchema}
      fieldInputMap={mapProps.fieldInputMap}
      onError={onError}
    />,
  );
  expect((await screen.findByRole('alert')).textContent).toBe(
    'Unable to load form.',
  );
  expect(screen.queryAllByTestId('item-name-input')).toHaveLength(0);
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      code: FormErrorCode.FormTypeInputMap,
      origin: 'load',
      details: expect.objectContaining({ path: '/items/**/name' }),
    }),
  );
  const record = onError.mock.calls[0][0];
  expect(record.message).toContain('Invalid key pattern in FieldInputMap');
  expect(record.message).toContain("Pattern:  '/items/**/name'");
  expect(host).toHaveBeenCalledExactlyOnceWith(record.error);
});

it('listing the depth with a single star selects the input without error', async () => {
  render(
    <Form
      jsonSchema={itemsSchema}
      defaultValue={{ items: [{ name: 'a' }, { name: 'b' }] }}
      fieldInputMap={{
        '/items/*/name': mapProps.fieldInputMap['/items/*/name'],
      }}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: ItemsLayout },
      ]}
    />,
  );
  expect(await screen.findAllByTestId('item-name-input')).toHaveLength(2);
});
