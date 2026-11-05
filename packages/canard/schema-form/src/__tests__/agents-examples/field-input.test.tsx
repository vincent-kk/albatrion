import {
  type FC,
  type ReactNode,
  createContext,
  createRef,
  useContext,
  useState,
} from 'react';

import {
  act,
  cleanup,
  fireEvent,
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

it('options.terminal false keeps a presentation.FieldInput object a branch with ChildFields', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { name: { type: 'string' }, age: { type: 'number' } },
        options: { terminal: false },
        presentation: { FieldInput: ObjectLayout },
      }}
    />,
  );
  await waitFor(() =>
    expect(view.container.querySelector('.grid')).not.toBeNull(),
  );
  expect(isTerminalNode(ref.current!.findNode('')!)).toBe(false);
  const grid = view.container.querySelector<HTMLElement>('.grid')!;
  expect(within(grid).getAllByRole('textbox')).toHaveLength(1);
  expect(within(grid).getAllByRole('spinbutton')).toHaveLength(1);
});

const CountContext = createContext(0);

const nameSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

/** Holds the changing state and passes it to a Form built from it.
 * @param props - Render function that receives the current count.
 * @returns A bump button, the live count and the provided content. */
function Counter({ children }: { children: (count: number) => ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={count}>
      <button onClick={() => setCount(count + 1)}>bump</button>
      <output data-testid="state">{count}</output>
      {children(count)}
    </CountContext.Provider>
  );
}

/** Reads the changing value through a hook inside the render function.
 * @returns The current context count. */
const FromHook = () => (
  <span data-testid="probe">{useContext(CountContext)}</span>
);

/** Mounts a probe form, bumps the state once and returns what the probe shows.
 * @param children - Render function building the form from the count.
 * @returns The live state text and the probe text after the bump. */
async function bumpAndRead(children: (count: number) => ReactNode) {
  render(<Counter>{children}</Counter>);
  const probe = await screen.findByTestId('probe');
  const before = probe.textContent;
  fireEvent.click(screen.getByText('bump'));
  await act(async () => {});
  return {
    before,
    state: screen.getByTestId('state').textContent,
    after: screen.getByTestId('probe').textContent,
  };
}

it('a Form.Render children function keeps the state it closed over at mount', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema}>
      <Form.Render path="/name">
        {() => <span data-testid="probe">{count}</span>}
      </Form.Render>
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '0' });
});

it('a Form.Render children function sees a changed Form context', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema} context={{ count }}>
      <Form.Render path="/name">
        {({ context }) => (
          <span data-testid="probe">{String(context.count)}</span>
        )}
      </Form.Render>
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '1' });
});

it('a Form.Render children function sees a changed React context through a hook', async () => {
  const seen = await bumpAndRead(() => (
    <Form jsonSchema={nameSchema}>
      <Form.Render path="/name">{FromHook}</Form.Render>
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '1' });
});

it('a new key on Form.Render replaces the component and its closure', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema}>
      <Form.Render key={count} path="/name">
        {() => <span data-testid="probe">{count}</span>}
      </Form.Render>
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '1' });
});

it('Form.Field keeps the FieldRenderer closure it had at mount', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema}>
      <Form.Field
        path="/name"
        FieldRenderer={() => <span data-testid="probe">{count}</span>}
      />
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '0' });
});

it('Form.Input keeps the FieldInput closure it had at mount while its other props follow every render', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema}>
      <Form.Input
        path="/name"
        FieldInput={() => <span data-testid="probe">{count}</span>}
      />
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '0' });

  cleanup();
  render(
    <Counter>
      {(count) => (
        <Form jsonSchema={nameSchema}>
          <Form.Input path="/name" placeholder={`hint ${count}`} />
        </Form>
      )}
    </Counter>,
  );
  expect(await screen.findByPlaceholderText('hint 0')).toBeTruthy();
  fireEvent.click(screen.getByText('bump'));
  expect(await screen.findByPlaceholderText('hint 1')).toBeTruthy();
});

/** Form.Input component reading the changing value from its `context` prop.
 * @param props - FieldInput props supplied by Form.
 * @returns The context count. */
const InputFromContext = ({ context }: FieldInputProps) => (
  <span data-testid="probe">{String(Reflect.get(context, 'count'))}</span>
);

it('a Form.Input FieldInput sees a changed Form context', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema} context={{ count }}>
      <Form.Input path="/name" FieldInput={InputFromContext} />
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '1' });
});

it('a Form.Input FieldInput sees a changed React context through a hook', async () => {
  const seen = await bumpAndRead(() => (
    <Form jsonSchema={nameSchema}>
      <Form.Input path="/name" FieldInput={FromHook} />
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '1' });
});

it('a new key on Form.Input replaces the component and its FieldInput closure', async () => {
  const seen = await bumpAndRead((count) => (
    <Form jsonSchema={nameSchema}>
      <Form.Input
        key={count}
        path="/name"
        FieldInput={() => <span data-testid="probe">{count}</span>}
      />
    </Form>
  ));
  expect(seen).toEqual({ before: '0', state: '1', after: '1' });
});
