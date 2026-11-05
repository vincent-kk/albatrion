import { type FC } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type FieldInputProps, Form } from '@/schema-form';

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
  '/items/**/name': ItemNameInput,  // ❌ throws when the form mounts
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
});

it('a key containing ** makes the form throw an invalid key pattern error on mount', async () => {
  const reported: string[] = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    reported.push(
      args.map((arg) => String((arg as Error)?.message ?? arg)).join(' '),
    );
  });
  render(
    <Form jsonSchema={itemsSchema} fieldInputMap={mapProps.fieldInputMap} />,
  );
  expect(
    await screen.findByText('An unexpected error has occurred'),
  ).toBeTruthy();
  expect(screen.queryAllByTestId('item-name-input')).toHaveLength(0);
  expect(
    reported.some((line) =>
      line.includes('Invalid key pattern in FieldInputMap'),
    ),
  ).toBe(true);
  expect(reported.join('\n')).toContain("Pattern:  '/items/**/name'");
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
