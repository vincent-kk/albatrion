import { type FC, createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import Ajv2020 from 'ajv/dist/2020';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type ArrayNode,
  type FieldInputDefinition,
  type FieldInputProps,
  FieldNodeEventType,
  Form,
  type FormHandle,
  type JSONSchema,
  type ValidationIssue,
  type ValidatorFactory,
  VirtualizationBackfill,
  type VirtualizationPlaceholderProps,
  isArrayNode,
  isTerminalNode,
} from '@/schema-form';

/** Draft 2020-12 adapter: tuples use `prefixItems`, which the default AJV draft does not know. */
const validator: ValidatorFactory = {
  compile(schema) {
    const validate = new Ajv2020({ allErrors: true, strict: false }).compile(
      schema,
    );
    return (value) =>
      validate(value)
        ? null
        : (validate.errors ?? []).map(
            (error): ValidationIssue => ({
              dataPath: error.instancePath,
              keyword: error.keyword,
              message: error.message,
              schemaPath: error.schemaPath,
            }),
          );
  },
  compileGuard(schema, pointer) {
    const ajv = new Ajv2020({ strict: false });
    ajv.addSchema(schema, 'urn:example:arrays-and-scale');
    const guard = ajv.getSchema(`urn:example:arrays-and-scale#${pointer}`);
    if (!guard) throw new Error('Example guard was not found');
    return (value) => guard(value) === true;
  },
};

/** Keeps literal schema types so a typed form handle can read the value shape. */
const defineSchema = <const Schema extends JSONSchema>(schema: Schema) =>
  schema;

/** Terminal array input: one text box edits the whole array at once.
 * @param props - FieldInput props supplied by Form.
 * @returns A single comma-separated input. */
function JoinedInput({ value, onChange }: FieldInputProps<string[]>) {
  return (
    <input
      aria-label="Joined"
      value={(value ?? []).join(',')}
      onChange={(event) => onChange(event.target.value.split(','))}
    />
  );
}

/** Branch array input that only lays out the item inputs.
 * @param props - FieldInput props supplied by Form.
 * @returns One row per item node. */
function RowsInput({ ChildFields }: FieldInputProps) {
  return (
    <div>
      {ChildFields.map((Child, index) => (
        <Child key={index} />
      ))}
    </div>
  );
}

const joinedDefinition: FieldInputDefinition[] = [
  { test: { type: 'array' }, Component: JoinedInput },
];
const rowsDefinition: FieldInputDefinition[] = [
  { test: { type: 'array' }, Component: RowsInput },
];

// prettier-ignore
const terminalSchema: JSONSchema = { type: 'array', items: { type: 'string' }, options: { terminal: true } }
// one input owns the whole array — no per-item node tree or per-item state

// prettier-ignore
const tupleSchema = defineSchema({
  type: 'array',
  prefixItems: [
    { type: 'number', title: 'X' },
    { type: 'number', title: 'Y' },
  ],
  items: false,   // closes the tuple; omit or set a schema to allow a rest type
}
// the value type is not inferred as a tuple; annotate it yourself if you need one
)

const bulkSchema = defineSchema({
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'number' } } },
    },
  },
});

afterEach(cleanup);

it('a terminal array is edited by one input and has no item nodes', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={terminalSchema}
      defaultValue={['a', 'b']}
      fieldInputDefinitions={joinedDefinition}
    />,
  );
  const input = await screen.findByLabelText<HTMLInputElement>('Joined');
  expect(input.value).toBe('a,b');
  expect(isTerminalNode(ref.current!.findNode('')!)).toBe(true);
  expect(ref.current!.findNode('/0')).toBeNull();
  fireEvent.change(input, { target: { value: 'x,y,z' } });
  expect(ref.current!.getValue()).toEqual(['x', 'y', 'z']);
  expect(ref.current!.findNode('/2')).toBeNull();
});

it('the same array is a branch with item nodes when terminal is off', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'array',
        items: { type: 'string' },
        options: { terminal: false },
      }}
      defaultValue={['a', 'b']}
      fieldInputDefinitions={rowsDefinition}
    />,
  );
  expect(await screen.findAllByRole('textbox')).toHaveLength(2);
  expect(isTerminalNode(ref.current!.findNode('')!)).toBe(false);
  expect(ref.current!.findNode('/1')).not.toBeNull();
});

it('items false closes a prefixItems tuple for validation, and push is never refused', async () => {
  const ref = createRef<FormHandle<typeof tupleSchema>>();
  render(
    <Form
      ref={ref}
      jsonSchema={tupleSchema}
      defaultValue={[1, 2]}
      validatorFactory={validator}
      fieldInputDefinitions={rowsDefinition}
    />,
  );
  expect(await screen.findAllByRole('spinbutton')).toHaveLength(2);
  const node = ref.current!.node as ArrayNode;
  expect(isArrayNode(node)).toBe(true);
  expect(await ref.current!.validate()).toEqual([]);

  act(() => {
    expect(node.push(3)).toBe(3);
  });
  expect(ref.current!.getValue()).toEqual([1, 2, 3]);
  const issues = await ref.current!.validate();
  expect(issues.length).toBeGreaterThan(0);
  expect(issues.map((issue) => issue.keyword)).toContain('items');
});

it('one setValue or one batch notifies the array node once while a push loop notifies per call', async () => {
  const formRef = createRef<FormHandle<typeof bulkSchema>>();
  render(
    <Form
      ref={formRef}
      jsonSchema={bulkSchema}
      fieldInputDefinitions={rowsDefinition}
    />,
  );
  await act(async () => {});
  const arrayNode = formRef.current!.findNode('/items') as ArrayNode;

  let deliveries = 0;
  let createCalls = 0;
  let deliveriesAfterLoop = -1;
  /** Each call yields new data so the second write is a real change; the 101st call opens the setValue pass. */
  const createItem = (_index: number) => {
    createCalls++;
    if (createCalls === 101) deliveriesAfterLoop = deliveries;
    return { id: createCalls };
  };
  const unsubscribe = arrayNode.subscribe(() => {
    deliveries++;
  });

  act(() => {
    // prettier-ignore
    {
// ❌ notifies 100 times
for (let i = 0; i < 100; i++) arrayNode.push(createItem(i));

// ✅ notifies once per affected node
formRef.current?.setValue((prev) => ({
  ...prev,
  items: Array.from({ length: 100 }, (_, i) => createItem(i)),
}));
    }
  });
  expect(deliveriesAfterLoop).toBe(100);
  expect(deliveries - deliveriesAfterLoop).toBe(1);
  expect(arrayNode.value).toHaveLength(100);

  const beforeBatch = deliveries;
  act(() => {
    arrayNode.batch(() => {
      for (let i = 0; i < 100; i++) arrayNode.push(createItem(i));
    });
  });
  expect(deliveries - beforeBatch).toBe(1);
  expect(arrayNode.value).toHaveLength(200);
  unsubscribe();
  expect(FieldNodeEventType.UpdateValue).toBeGreaterThan(0);
});

it('a listener that writes again starts another delivery, so one setValue no longer notifies once', async () => {
  const formRef = createRef<FormHandle<typeof bulkSchema>>();
  render(
    <Form
      ref={formRef}
      jsonSchema={bulkSchema}
      fieldInputDefinitions={rowsDefinition}
    />,
  );
  await act(async () => {});
  const arrayNode = formRef.current!.findNode('/items') as ArrayNode;

  let deliveries = 0;
  let wroteAgain = false;
  arrayNode.subscribe(() => {
    deliveries++;
    if (wroteAgain) return;
    wroteAgain = true;
    arrayNode.push({ id: -1 });
  });
  act(() => {
    formRef.current!.setValue({ items: [{ id: 1 }, { id: 2 }] });
  });
  expect(deliveries).toBe(2);
  expect(arrayNode.value).toHaveLength(3);
});

const ArrayInput: FC<FieldInputProps<any[]>> = ({ node, ChildFields }) => (
  <div>
    <button onClick={() => (node as ArrayNode).push()}>Add</button>
    {ChildFields.map((Child, i) => (
      <div key={i}>
        <Child />
        <button onClick={() => (node as ArrayNode).remove(i)}>Remove</button>
      </div>
    ))}
  </div>
);

it('a registered array input renders items through ChildFields with push and remove', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['a', 'b']}
      fieldInputDefinitions={[
        { test: { type: 'array' }, Component: ArrayInput },
      ]}
    />,
  );
  expect(await screen.findAllByRole('textbox')).toHaveLength(2);
  fireEvent.click(screen.getByText('Add'));
  expect(await screen.findAllByRole('textbox')).toHaveLength(3);
  expect(ref.current!.getValue()).toHaveLength(3);
  fireEvent.click(screen.getAllByText('Remove')[0]);
  expect(await screen.findAllByRole('textbox')).toHaveLength(2);
  expect(ref.current!.getValue()).toEqual(['b', null]);
});

it('the same input registered as presentation.FieldInput makes the array terminal with empty ChildFields', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'array',
        items: { type: 'string' },
        presentation: { FieldInput: ArrayInput },
      }}
      defaultValue={['a', 'b']}
    />,
  );
  expect(await screen.findByText('Add')).toBeTruthy();
  expect(isTerminalNode(ref.current!.findNode('')!)).toBe(true);
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  expect(screen.queryAllByText('Remove')).toHaveLength(0);
});

it('options.terminal false keeps a presentation.FieldInput array a branch with ChildFields', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'array',
        items: { type: 'string' },
        options: { terminal: false },
        presentation: { FieldInput: ArrayInput },
      }}
      defaultValue={['a', 'b']}
    />,
  );
  expect(await screen.findAllByRole('textbox')).toHaveLength(2);
  expect(isTerminalNode(ref.current!.findNode('')!)).toBe(false);
  expect(screen.getAllByText('Remove')).toHaveLength(2);
});

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly observed = new Set<Element>();
  constructor(readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }
  observe(element: Element) {
    this.observed.add(element);
  }
  unobserve(element: Element) {
    this.observed.delete(element);
  }
  disconnect() {
    this.observed.clear();
  }
  intersect(element: Element) {
    this.callback(
      [{ target: element, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

type IdleCallback = (deadline: {
  didTimeout: boolean;
  timeRemaining: () => number;
}) => void;
const idleQueue: IdleCallback[] = [];

const largeSchema: JSONSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: 100 }, (_, index) => [
      `f${String(index).padStart(3, '0')}`,
      { type: 'string' },
    ]),
  ),
};

/** Decorative stand-in drawn while a field is deferred.
 * @param props - Reserved height supplied by the virtualization layer.
 * @returns A marker element with that height. */
const FieldSkeleton = ({ height }: VirtualizationPlaceholderProps) => (
  <div data-testid="skeleton" style={{ height }} />
);

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  idleQueue.length = 0;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal('requestIdleCallback', (callback: IdleCallback) => {
    idleQueue.push(callback);
    return idleQueue.length;
  });
  vi.stubGlobal('cancelIdleCallback', () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('virtualization defers off-screen fields and mounts them near the viewport or on idle', async () => {
  // prettier-ignore
  const largeForms = <>
<Form jsonSchema={largeSchema} virtualization />
// or with options:
<Form
  jsonSchema={largeSchema}
  virtualization={{
    threshold: 30,       // gate a branch only when it has >= 30 children
    eagerCount: 20,      // mount the leading 20 fields immediately
    rootMargin: '100%',  // IntersectionObserver margin — px or % only
    backfill: VirtualizationBackfill.Idle,  // or .None: reveal only on scroll/commands
    estimateHeight: 40,  // placeholder height px, or (node) => number
    Placeholder: FieldSkeleton,             // optional visual fill
  }}
/>
</>;
  const view = render(largeForms);
  await act(async () => {});

  expect(screen.getAllByRole('textbox')).toHaveLength(40);
  expect(screen.getAllByTestId('skeleton')).toHaveLength(80);
  expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0);

  const observer = MockIntersectionObserver.instances.find(
    (instance) => instance.observed.size > 0,
  )!;
  const [placeholder] = [...observer.observed];
  await act(async () => {
    observer.intersect(placeholder);
  });
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(40);

  while (idleQueue.length > 0)
    await act(async () => {
      for (const callback of idleQueue.splice(0))
        callback({ didTimeout: false, timeRemaining: () => 50 });
    });
  expect(screen.getAllByRole('textbox')).toHaveLength(200);
  expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
  expect(within(view.container).getAllByRole('textbox')).toHaveLength(200);
});
