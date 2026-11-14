import { type FC } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type FieldInputProps, Form, ValidationMode } from '@/schema-form';

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
  '/items/**/name': ItemNameInput,  // literal ** name; not recursive
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

it('keeps literal double-star keys without errors or warnings', async () => {
  const onError = vi.fn();
  const host = vi.fn();
  const warning = vi.spyOn(console, 'warn');
  vi.stubGlobal('reportError', host);
  render(
    <Form
      jsonSchema={itemsSchema}
      defaultValue={{ items: [{ name: 'a' }] }}
      fieldInputMap={mapProps.fieldInputMap}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: ItemsLayout },
      ]}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  expect(await screen.findAllByTestId('item-name-input')).toHaveLength(1);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(onError).not.toHaveBeenCalled();
  expect(host).not.toHaveBeenCalled();
  expect(warning).not.toHaveBeenCalled();
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
