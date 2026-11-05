import { type FC, createRef } from 'react';

import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputDefinition,
  type FieldInputProps,
  Form,
  type FormHandle,
  isTerminalNode,
} from '@/schema-form';

/** Marker input chosen by a partial-match `test` object.
 * @returns A password field marked for lookup. */
const PasswordInput: FC<FieldInputProps<string>> = () => (
  <input type="password" data-testid="password-input" />
);

/** Marker input chosen by a `test` predicate.
 * @returns A select marked for lookup. */
const SelectInput: FC<FieldInputProps<string>> = () => (
  <select data-testid="select-input" />
);

/** Marker input mapped by path to array item names.
 * @returns A field marked for lookup. */
const ItemNameInput: FC<FieldInputProps<string>> = () => (
  <input data-testid="item-name-input" />
);

/** Marker input mapped by path to every metadata value.
 * @returns A field marked for lookup. */
const MetadataValueInput: FC<FieldInputProps<string>> = () => (
  <input data-testid="metadata-value-input" />
);

/** Branch array input that lays out item inputs.
 * @param props - FieldInput props supplied by Form.
 * @returns One slot per item node. */
const ItemsLayout: FC<FieldInputProps> = ({ ChildFields }) => (
  <div>
    {ChildFields.map((Child, index) => (
      <Child key={index} />
    ))}
  </div>
);

const definitions: FieldInputDefinition[] = [
  { test: { type: 'string', format: 'password' }, Component: PasswordInput },
  {
    test: (hint) => hint.type === 'string' && !!hint.jsonSchema.enum,
    Component: SelectInput,
  },
];

// prettier-ignore
const mapProps = {
fieldInputMap: {
  '/items/*/name': ItemNameInput,
  '/metadata/*': MetadataValueInput,
}
}

const ObjectLayout: FC<FieldInputProps<Record<string, any>>> = ({
  ChildFields,
}) => (
  <div className="grid">
    {ChildFields.map((Child, i) => (
      <Child key={i} />
    ))}
  </div>
);

afterEach(cleanup);

it('a definition selects an input by a test object or by a test function', async () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          secret: { type: 'string', format: 'password' },
          color: { type: 'string', enum: ['red', 'green'] },
          plain: { type: 'string' },
          mail: { type: 'string', format: 'email' },
        },
      }}
      fieldInputDefinitions={definitions}
    />,
  );
  expect(await screen.findAllByTestId('password-input')).toHaveLength(1);
  expect(screen.getAllByTestId('select-input')).toHaveLength(1);
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
});

it('wildcard path keys match array indexes and object keys, one segment each', async () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                note: { type: 'string' },
              },
            },
          },
          metadata: {
            type: 'object',
            properties: { a: { type: 'string' }, b: { type: 'string' } },
          },
        },
      }}
      defaultValue={{
        items: [{ name: 'n0' }, { name: 'n1' }, { name: 'n2' }],
        metadata: { a: '1', b: '2' },
      }}
      fieldInputMap={mapProps.fieldInputMap}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: ItemsLayout },
      ]}
    />,
  );
  expect(await screen.findAllByTestId('item-name-input')).toHaveLength(3);
  expect(screen.getAllByTestId('metadata-value-input')).toHaveLength(2);
  expect(document.querySelectorAll('input:not([data-testid])')).toHaveLength(3);
});

it('a non-terminal object input shows its children only by rendering ChildFields', async () => {
  const schema = {
    type: 'object',
    properties: { name: { type: 'string' }, age: { type: 'number' } },
  } as const;
  const view = render(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: ObjectLayout },
      ]}
    />,
  );
  await waitFor(() =>
    expect(view.container.querySelector('.grid')).not.toBeNull(),
  );
  const grid = view.container.querySelector<HTMLElement>('.grid')!;
  expect(within(grid).getAllByRole('textbox')).toHaveLength(1);
  expect(within(grid).getAllByRole('spinbutton')).toHaveLength(1);
  view.unmount();

  const Silent: FC<FieldInputProps> = () => <div data-testid="silent" />;
  render(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={[{ test: { type: 'object' }, Component: Silent }]}
    />,
  );
  expect(await screen.findByTestId('silent')).toBeTruthy();
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
  cleanup();

  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ ...schema, presentation: { FieldInput: ObjectLayout } }}
    />,
  );
  await act(async () => {});
  expect(isTerminalNode(ref.current!.findNode('')!)).toBe(true);
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
});
