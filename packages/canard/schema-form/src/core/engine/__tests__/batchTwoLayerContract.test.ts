import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { isArrayNode } from '../../surface';
import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Call = (root: Root) => void;
type Retained = readonly { readonly path: string; readonly value: unknown }[];

/** Observable result of a call list: the object field of the root value and every retained source. */
type Observed = { readonly object: unknown; readonly retained: Retained };

const parse = (target: string, value: unknown) =>
  typeof value === 'string' ? { [target]: JSON.parse(value) } : {};

/**
 * y and nested.q are active while /on is true; source injects a JSON object into object and the
 * later-declared nestedSource injects into object.nested, so nestedSource ranks higher on overlap.
 */
const createSchema = (y: Record<string, unknown> = {}): AuthoredSchema => ({
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    other: { type: 'boolean' },
    object: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string', controls: { active: '/on === true', ...y } },
        nested: {
          type: 'object',
          properties: {
            p: { type: 'string' },
            q: { type: 'string', controls: { active: '/on === true' } },
          },
        },
        list: { type: 'array', items: { type: 'string' } },
      },
    },
    source: {
      type: 'string',
      controls: { injectTo: (value: unknown) => parse('../object', value) },
    },
    nestedSource: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) => parse('../object/nested', value),
      },
    },
  },
  options: { virtual: { group: { fields: ['object', 'other'] } } },
});

const INITIAL = {
  x: 'x0',
  y: 'y0',
  nested: { p: 'p0', q: 'q0' },
  list: ['l0'],
};

const create = (on: boolean, y?: Record<string, unknown>) =>
  nodeFromJSONSchema({
    jsonSchema: createSchema(y),
    defaultValue: { on, other: false, object: INITIAL },
    validationMode: ValidationMode.None,
  });

const set =
  (path: string, value: unknown): Call =>
  (root) =>
    root.find(path)!.setValue(value);
const inject = (value: unknown) => set('/source', JSON.stringify(value));
const injectNested = (value: unknown) =>
  set('/nestedSource', JSON.stringify(value));
const reset =
  (path: string): Call =>
  (root) =>
    root.find(path)!.resetSubtree();

const observe = (root: Root): Observed => {
  const value: unknown = root.value;
  return {
    object:
      value !== null && typeof value === 'object' && 'object' in value
        ? value.object
        : undefined,
    retained: root.inactiveValues.map(({ path, value }) => ({ path, value })),
  };
};

const runCalls = (
  calls: readonly Call[],
  batched: boolean,
  on: boolean,
  y?: Record<string, unknown>,
) => {
  const root = create(on, y);
  const apply = () => {
    for (const call of calls) call(root);
  };
  if (batched) root.batch(apply);
  else apply();
  return observe(root);
};

const keep = (y: unknown, q: unknown): Retained => [
  { path: '/object/y', value: y },
  { path: '/object/nested/q', value: q },
];

/**
 * One case per call list: the batch must leave `expected`, written from the two-layer contract.
 * `isSequenceEqual` marks lists where no rule observes an intermediate state, so the sequence must
 * leave the same result; the others show the trace the sequence keeps of a rule reacting to an
 * intermediate state (WRITE-079).
 */
type Case = {
  readonly name: string;
  readonly on: boolean;
  readonly calls: readonly Call[];
  readonly expected: Observed;
  readonly isSequenceEqual: boolean;
};

const CASES: readonly Case[] = [
  {
    name: 'an unrelated caller write and an empty injected object',
    on: true,
    calls: [set('/other', true), inject({})],
    expected: { object: undefined, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'an injected value for an inactive nested field',
    on: false,
    calls: [set('/other', true), inject({ nested: { q: 'newq' } })],
    expected: { object: undefined, retained: keep('y0', 'newq') },
    isSequenceEqual: true,
  },
  {
    name: 'an injected object omitting an inactive nested field',
    on: false,
    calls: [set('/other', true), inject({ nested: { p: 'newp' } })],
    expected: { object: { nested: { p: 'newp' } }, retained: keep('y0', 'q0') },
    isSequenceEqual: true,
  },
  {
    name: 'an injected array longer than the current one',
    on: true,
    calls: [set('/other', true), inject({ list: ['a', 'b', 'c'] })],
    expected: { object: { list: ['a', 'b', 'c'] }, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'a caller merge followed by an empty injected object',
    on: true,
    calls: [
      (root) => root.find('/object')!.setValue({ x: 'caller' }, WriteOption.Merge),
      inject({}),
    ],
    expected: { object: undefined, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'a caller child write followed by an injected nested object',
    on: true,
    calls: [set('/object/nested/p', 'caller'), inject({ nested: { q: 'newq' } })],
    expected: { object: { nested: { q: 'newq' } }, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'an updater followed by an injected object',
    on: true,
    calls: [
      (root) =>
        root.find('/object')!.setValue((previous: unknown) => ({
          ...(previous !== null && typeof previous === 'object' ? previous : {}),
          x: 'up',
        })),
      inject({ list: ['new'] }),
    ],
    expected: { object: { list: ['new'] }, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'a nested batch followed by an injected object',
    on: false,
    calls: [
      (root) => root.batch(() => root.find('/other')!.setValue(true)),
      inject({ y: 'ret', nested: { q: 'retq' } }),
    ],
    expected: { object: undefined, retained: keep('ret', 'retq') },
    isSequenceEqual: true,
  },
  {
    name: 'a single trigger',
    on: false,
    calls: [inject({ y: 'ret', nested: { q: 'retq' } })],
    expected: { object: undefined, retained: keep('ret', 'retq') },
    isSequenceEqual: true,
  },
  {
    name: 'a gate opening before the trigger',
    on: false,
    calls: [set('/on', true), inject({ nested: { q: 'entered' } })],
    expected: { object: { nested: { q: 'entered' } }, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'a gate closing before a trigger that omits the leaving fields',
    on: true,
    calls: [set('/on', false), inject({ nested: { p: 'newp' } })],
    expected: { object: { nested: { p: 'newp' } }, retained: keep('y0', 'q0') },
    isSequenceEqual: true,
  },
  {
    name: 'an inactive ancestor write followed by a child rule',
    on: false,
    calls: [inject({ nested: { q: 'retq' } }), injectNested({ p: 'newp' })],
    expected: { object: { nested: { p: 'newp' } }, retained: keep('y0', 'retq') },
    isSequenceEqual: true,
  },
  {
    name: 'a caller write after the trigger it overlaps',
    on: true,
    calls: [inject({ x: 'auto' }), set('/object/x', 'caller')],
    expected: { object: { x: 'auto' }, retained: [] },
    isSequenceEqual: false,
  },
  {
    name: 'a gate closing after the trigger',
    on: true,
    calls: [inject({ y: 'newy' }), set('/on', false)],
    expected: { object: undefined, retained: keep('newy', 'q0') },
    isSequenceEqual: false,
  },
  {
    name: 'a source written twice',
    on: false,
    calls: [inject({ y: 'first' }), inject({ x: 'last' })],
    expected: { object: { x: 'last' }, retained: keep('y0', 'q0') },
    isSequenceEqual: false,
  },
  {
    name: 'overlapping rules triggered against their rank',
    on: true,
    calls: [injectNested({ p: 'child' }), inject({ x: 'parent' })],
    expected: { object: { x: 'parent', nested: { p: 'child' } }, retained: [] },
    isSequenceEqual: false,
  },
  {
    name: 'a source written on both sides of an array barrier',
    on: false,
    calls: [
      inject({ y: 'first' }),
      (root) => {
        const list = root.find('/object/list');
        if (isArrayNode(list)) list.push('p');
      },
      inject({ x: 'last' }),
    ],
    expected: { object: { x: 'last' }, retained: keep('first', 'q0') },
    isSequenceEqual: true,
  },
  {
    name: 'a higher overlapping winner equal to the initial value',
    on: true,
    calls: [inject({ nested: { p: 'low' } }), injectNested({ p: 'p0', q: 'q0' })],
    expected: { object: { nested: { p: 'p0', q: 'q0' } }, retained: [] },
    isSequenceEqual: true,
  },
  {
    name: 'a subtree reset after a pending trigger outside its scope',
    on: true,
    calls: [inject({ x: 'auto' }), reset('/object')],
    expected: {
      object: { x: 'x0', y: 'y0', nested: { p: 'p0', q: 'q0' } },
      retained: [],
    },
    isSequenceEqual: true,
  },
];

describe('batch caller layer and reaction layer (WRITE-079, EVENT-019)', () => {
  it.each(CASES)('$name', ({ on, calls, expected, isSequenceEqual }) => {
    if (isSequenceEqual) expect(runCalls(calls, false, on)).toEqual(expected);
    else expect(runCalls(calls, false, on)).not.toEqual(expected);
    expect(runCalls(calls, true, on)).toEqual(expected);
  });
});

describe('a declarative write to a leaving field follows its exit policy first (WRITE-079)', () => {
  it.each([
    { policy: { unsetOnInactive: true }, written: {}, retained: [] },
    {
      policy: { unsetOnInactive: true },
      written: { y: 'new' },
      retained: [{ path: '/object/y', value: 'new' }],
    },
    {
      policy: { inactiveValue: 'resolved' },
      written: {},
      retained: [{ path: '/object/y', value: 'resolved' }],
    },
    {
      policy: { inactiveValue: 'resolved' },
      written: { y: 'new' },
      retained: [{ path: '/object/y', value: 'new' }],
    },
  ])('$policy with $written', ({ policy, written, retained }) => {
    const calls = [set('/on', false), inject(written)];
    for (const batched of [false, true]) {
      const observed = runCalls(calls, batched, true, policy);
      expect(observed.object).toBeUndefined();
      expect(
        observed.retained.filter(({ path }) => path === '/object/y'),
      ).toEqual(retained);
    }
  });
});

describe('subtree reset ends a mark segment (EVENT-013)', () => {
  const RESET_CASES: readonly {
    readonly name: string;
    readonly on: boolean;
    readonly calls: readonly Call[];
    readonly expected: Observed;
  }[] = [
    {
      name: 'a virtual group reset after a pending trigger',
      on: true,
      calls: [inject({ x: 'auto' }), reset('/group')],
      expected: {
        object: { x: 'x0', y: 'y0', nested: { p: 'p0', q: 'q0' } },
        retained: [],
      },
    },
    {
      name: 'an array reset after a pending trigger that replaced its item',
      on: true,
      calls: [inject({ list: ['a'] }), reset('/object/list')],
      expected: { object: { list: ['l0'] }, retained: [] },
    },
    {
      name: 'a reset under a pending ancestor merge',
      on: true,
      calls: [
        (root) =>
          root.setValue(
            { object: { x: 'm', nested: { p: 'm' } } },
            WriteOption.Merge,
          ),
        reset('/object/nested'),
      ],
      expected: {
        object: { ...INITIAL, x: 'm', nested: { p: 'p0', q: 'q0' } },
        retained: [],
      },
    },
    {
      name: 'a reset inside a nested batch',
      on: true,
      calls: [
        inject({ x: 'auto' }),
        (root) => root.batch(() => root.find('/object')!.resetSubtree()),
      ],
      expected: {
        object: { x: 'x0', y: 'y0', nested: { p: 'p0', q: 'q0' } },
        retained: [],
      },
    },
    (() => {
      let target: ReturnType<Root['find']>;
      return {
        name: 'a reset whose scope the settlement of its earlier marks makes inactive',
        on: true,
        calls: [
          (root: Root) => {
            target = root.find('/object/nested/q');
            target!.setValue('v');
          },
          (root: Root) => root.find('/on')!.setValue(false),
          () => target!.resetSubtree(),
        ],
        expected: {
          object: { x: 'x0', nested: { p: 'p0' }, list: ['l0'] },
          retained: keep('y0', 'v'),
        },
      };
    })(),
    {
      name: 'a source written on both sides of a reset',
      on: false,
      calls: [inject({ y: 'first' }), reset('/object'), inject({ x: 'last' })],
      expected: { object: { x: 'last' }, retained: keep('y0', 'q0') },
    },
  ];

  it.each(RESET_CASES)('$name', ({ on, calls, expected }) => {
    expect(runCalls(calls, false, on)).toEqual(expected);
    expect(runCalls(calls, true, on)).toEqual(expected);
  });

  it('a detached reference does not settle the pending marks', () => {
    const root = create(true);
    const detached = root.find('/object/list/0')!;
    const list = root.find('/object/list');
    if (isArrayNode(list)) list.clear();
    const before = observe(root).object;
    let committed: unknown;
    root.batch(() => {
      inject({ x: 'auto' })(root);
      detached.resetSubtree();
      committed = observe(root).object;
    });
    expect(committed).toEqual(before);
    expect(observe(root)).toEqual({ object: { x: 'auto' }, retained: [] });
  });
});
