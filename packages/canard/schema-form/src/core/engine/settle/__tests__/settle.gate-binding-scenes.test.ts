import { existsSync, writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import {
  dispatchMount,
  dispatchPush,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { readFieldNodeErrors, routeValidationIssues } from '../../validation';
import { getGateRegistry } from '../utils/gates/getGateRegistry';

/*
 * Gate binding through recursive references: an item takes its own branch, an outer item's
 * contribution reaches its children, a presence gate reads across references, and an item's own
 * keyword follows its own discriminator. Each case is also compared with a fresh load.
 */

const OUT =
  '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/b5781004-ec7c-4a1e-8b24-8f294a15778d/scratchpad/gb/results/';
const observations: Record<string, unknown> = {};
afterAll(() => {
  if (existsSync(OUT))
    writeFileSync(
      `${OUT}scenes-${Date.now()}.json`,
      JSON.stringify(observations, null, 1),
    );
});

type Node = DispatchTestNode;

const mount = (schema: BlueprintSchema, value: unknown): Node => {
  const { root, runtime } = createDispatchTree(
    schema,
    value,
    createTestValidator(),
  );
  runtime.validationMode = ValidationMode.None;
  dispatchMount(root, value, undefined, { deferValidation: true });
  return root;
};

const at = (root: Node, path: string): Node | undefined => {
  let node: Node | undefined = root;
  for (const name of path.split('/').slice(1)) {
    node = node?.__childrenByName__?.[name];
    if (!node) return undefined;
  }
  return node;
};

const walk = (root: Node): Node[] => {
  const nodes: Node[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.shift();
    if (!node) break;
    nodes.push(node);
    for (const child of node.children ?? []) pending.push(child);
  }
  return nodes;
};

const write = (root: Node, path: string, value: unknown): string => {
  const node = at(root, path);
  if (!node) return `absent ${path}`;
  try {
    dispatchSetValue(node, value);
    return 'ok';
  } catch (error) {
    return `threw ${String(error instanceof Error ? error.message : error)}`;
  }
};

const push = (root: Node, path: string, value: unknown): string => {
  const node = at(root, path);
  if (!node) return `absent ${path}`;
  try {
    dispatchPush(node, value);
    return 'ok';
  } catch (error) {
    return `threw ${String(error instanceof Error ? error.message : error)}`;
  }
};

const readMinLength = (node: Node | undefined): unknown => {
  const schema = node?.__schema__.schema;
  return schema && typeof schema === 'object' ? schema.minLength : 'absent';
};

/** Every `value` field with its own item's kind and its selected branch evidence. */
const readBranches = (root: Node, prefix: string) => {
  const fields = walk(root).filter((node) => node.name === 'value');
  const issues = fields.flatMap((node) =>
    [0, 1].map((branch) => ({
      dataPath: node.path,
      schemaPath: `${prefix}/oneOf/${branch}/properties/value/minLength`,
    })),
  );
  routeValidationIssues([root], issues);
  return fields.map((field) => ({
    path: field.path,
    kind: field.__parent__?.__childrenByName__?.kind?.__value__,
    minLength: readMinLength(field),
    routed: readFieldNodeErrors(field).map((issue) =>
      (issue.schemaPath ?? '').replace(/.*oneOf\/(\d+)\/.*/, '$1'),
    ),
  }));
};

/** Own-branch scenes: branch 0 only for x (minLength 3), branch 1 only for y (minLength 5). */
const expectedBranches = (
  observed: ReturnType<typeof readBranches>,
): ReturnType<typeof readBranches> =>
  observed.map((field) => ({
    ...field,
    minLength: field.kind === 'x' ? 3 : field.kind === 'y' ? 5 : 'kind?',
    routed: [field.kind === 'x' ? '0' : field.kind === 'y' ? '1' : 'kind?'],
  }));

const discriminatedItem = {
  type: 'object',
  controls: { discriminator: 'kind' },
  properties: {
    kind: { type: 'string' },
    value: { type: 'string' },
    children: { type: 'array', items: { $ref: '#/$defs/item' } },
  },
  oneOf: [
    { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
    { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
  ],
} as const;
const recursiveB1: BlueprintSchema = {
  type: 'array',
  items: { $ref: '#/$defs/item' },
  $defs: { item: discriminatedItem },
};
const plainB1: BlueprintSchema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: { kind: { type: 'string' }, value: { type: 'string' } },
        oneOf: [
          { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
          { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
        ],
      },
    },
  },
};

const leaf = (kind: string) => ({ kind, value: 'a', children: [] });

describe('an item takes its own branch', () => {
  it('recursive children: mount, two writes, push, fresh load', () => {
    const root = mount(recursiveB1, [
      { kind: 'x', value: 'a', children: [leaf('x'), leaf('x')] },
    ]);
    const mounted = readBranches(root, '#/$defs/item');
    const writes = [
      write(root, '/0/children/0/kind', 'y'),
      write(root, '/0/children/1/kind', 'y'),
    ];
    const written = readBranches(root, '#/$defs/item');
    const pushed = push(root, '/0/children', leaf('y'));
    const afterPush = readBranches(root, '#/$defs/item');
    const fresh = readBranches(
      mount(recursiveB1, [
        { kind: 'x', value: 'a', children: [leaf('y'), leaf('y'), leaf('y')] },
      ]),
      '#/$defs/item',
    );
    const observed = { mounted, writes, written, pushed, afterPush, fresh };
    observations['B1 recursive'] = observed;
    expect(observed).toEqual({
      mounted: expectedBranches(mounted),
      writes: ['ok', 'ok'],
      written: expectedBranches(written),
      pushed: 'ok',
      afterPush: expectedBranches(afterPush),
      fresh: expectedBranches(fresh),
    });
  });

  it('recursive grandchildren: writes and push one level deeper', () => {
    const root = mount(recursiveB1, [
      {
        kind: 'x',
        value: 'a',
        children: [{ kind: 'x', value: 'a', children: [leaf('x'), leaf('x')] }],
      },
    ]);
    const writes = [
      write(root, '/0/children/0/children/0/kind', 'y'),
      write(root, '/0/children/0/children/1/kind', 'y'),
    ];
    const written = readBranches(root, '#/$defs/item');
    const pushed = push(root, '/0/children/0/children', leaf('y'));
    const afterPush = readBranches(root, '#/$defs/item');
    const observed = { writes, written, pushed, afterPush };
    observations['B1 grandchildren'] = observed;
    expect(observed).toEqual({
      writes: ['ok', 'ok'],
      written: expectedBranches(written),
      pushed: 'ok',
      afterPush: expectedBranches(afterPush),
    });
  });

  it('plain list: writes and push', () => {
    const root = mount(plainB1, {
      list: [
        { kind: 'x', value: 'a' },
        { kind: 'x', value: 'a' },
      ],
    });
    const writes = [
      write(root, '/list/0/kind', 'y'),
      write(root, '/list/1/kind', 'y'),
    ];
    const written = readBranches(root, '#/properties/list/items');
    const pushed = push(root, '/list', { kind: 'y', value: 'a' });
    const afterPush = readBranches(root, '#/properties/list/items');
    const observed = { writes, written, pushed, afterPush };
    observations['B1 plain'] = observed;
    expect(observed).toEqual({
      writes: ['ok', 'ok'],
      written: expectedBranches(written),
      pushed: 'ok',
      afterPush: expectedBranches(afterPush),
    });
  });
});

const makeB2 = (form: 'if' | 'active'): BlueprintSchema => {
  const contribution = {
    properties: {
      children: { items: { properties: { value: { minLength: 3 } } } },
    },
  };
  const properties = {
    kind: { type: 'string' },
    value: { type: 'string' },
    children: { type: 'array', items: { $ref: '#/$defs/item' } },
  };
  const item =
    form === 'if'
      ? {
          type: 'object',
          properties,
          if: { properties: { kind: { const: 'strict' } }, required: ['kind'] },
          then: contribution,
        }
      : {
          type: 'object',
          properties,
          allOf: [
            { controls: { active: "./kind === 'strict'" }, ...contribution },
          ],
        };
  return { type: 'array', items: { $ref: '#/$defs/item' }, $defs: { item } };
};
const B2_PATHS = [
  '/0/children/0/value',
  '/0/children/0/children/0/value',
  '/1/children/0/value',
  '/1/children/0/children/0/value',
];

describe('an outer item contributes to its children', () => {
  it.each(['if', 'active'] as const)(
    '%s: mount, /1/kind = strict, /1/children/0/kind = loose',
    (form) => {
      const root = mount(makeB2(form), [
        {
          kind: 'strict',
          value: 'a',
          children: [{ kind: 'loose', value: 'a', children: [leaf('loose')] }],
        },
        {
          kind: 'loose',
          value: 'a',
          children: [{ kind: 'strict', value: 'a', children: [leaf('loose')] }],
        },
      ]);
      const read = () => B2_PATHS.map((path) => readMinLength(at(root, path)));
      const mounted = read();
      const first = write(root, '/1/kind', 'strict');
      const afterOuter = read();
      const second = write(root, '/1/children/0/kind', 'loose');
      const afterInner = read();
      const observed = { mounted, first, afterOuter, second, afterInner };
      observations[`B2 ${form}`] = observed;
      expect(observed).toEqual({
        mounted: [3, undefined, undefined, 3],
        first: 'ok',
        afterOuter: [3, undefined, 3, 3],
        second: 'ok',
        afterInner: [3, undefined, 3, undefined],
      });
    },
  );
});

const UNBOUNDED_LINK = {
  type: 'object',
  properties: {
    enabled: { type: 'boolean', default: true },
    next: {
      type: 'array',
      default: [{}],
      items: { $ref: '#/$defs/UnboundedLink' },
      controls: { active: '../enabled === true' },
    },
    distant: {
      type: 'boolean',
      controls: { active: `${'../'.repeat(20)}grow === true` },
    },
  },
} as const;
/** Copy of `addUnboundedFillChain({ type: 'object' })` (656ad11d2 fixture). */
const chainB3: BlueprintSchema = {
  type: 'object',
  properties: {
    grow: { type: 'boolean' },
    chain: {
      type: 'array',
      default: [{}],
      items: { $ref: '#/$defs/UnboundedLink' },
      controls: { active: '../grow === true' },
    },
  },
  $defs: { UnboundedLink: UNBOUNDED_LINK },
};

/** Registry occurrences registered at one live owner, as host and schema path. */
const readOccurrences = (root: Node, path: string) => {
  const registry: unknown = getGateRegistry(root.runtime);
  const byPath: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'byPath')
      : undefined;
  const registration: unknown =
    byPath instanceof Map ? byPath.get(path) : undefined;
  const occurrences: unknown =
    registration && typeof registration === 'object'
      ? Reflect.get(registration, 'occurrences')
      : undefined;
  if (!Array.isArray(occurrences)) return [];
  return occurrences.map((occurrence: unknown) => {
    const read = (key: string): unknown =>
      occurrence && typeof occurrence === 'object'
        ? Reflect.get(occurrence, key)
        : undefined;
    const gate = read('gate');
    return {
      schemaPath:
        gate && typeof gate === 'object' ? Reflect.get(gate, 'schemaPath') : '',
      hostPath: read('hostPath'),
      evaluationHostPath: read('evaluationHostPath'),
      watchPaths: read('watchPaths'),
    };
  });
};

describe('a presence gate read across references', () => {
  it('unbounded fill chain: setting grow exhausts the transition budget and keeps Source B', () => {
    const root = mount(chainB3, {});
    const result = write(root, '/grow', true);
    const observed = {
      threw: result.startsWith('threw'),
      grow: at(root, '/grow')?.source,
      chain: at(root, '/chain')?.source,
      diagnostics: {
        status: root.runtime.diagnostics.status,
        exceededBudget: Reflect.get(root.runtime.diagnostics, 'exceededBudget'),
      },
    };
    observations['B3 unbounded'] = observed;
    expect(observed).toEqual({
      threw: true,
      grow: true,
      chain: undefined,
      diagnostics: { status: 'degraded', exceededBudget: 'transition' },
    });
  });

  it('finite chain: the third link and its admitting array read /grow through the chain gate', () => {
    const root = mount(chainB3, {
      grow: true,
      chain: [
        {
          enabled: true,
          next: [{ enabled: true, next: [{ enabled: false }] }],
        },
      ],
    });
    const third = '/chain/0/next/0/next/0';
    const chainGate = '#/properties/chain/controls/active';
    const reads = (path: string) =>
      readOccurrences(root, path)
        .filter((occurrence) => occurrence.schemaPath === chainGate)
        .map((occurrence) => ({
          hostPath: occurrence.hostPath,
          watchPaths: occurrence.watchPaths,
        }));
    const before = {
      present: !!at(root, third),
      admitting: reads('/chain/0/next/0/next'),
    };
    const off = write(root, '/grow', false);
    const offPresent = !!at(root, third);
    const on = write(root, '/grow', true);
    const observed = {
      before,
      off,
      offPresent,
      on,
      onPresent: !!at(root, third),
    };
    observations['B3 finite'] = observed;
    expect(observed).toEqual({
      before: {
        present: true,
        admitting: [{ hostPath: '/chain', watchPaths: ['/grow'] }],
      },
      off: 'ok',
      offPresent: false,
      on: 'ok',
      onPresent: true,
    });
  });
});

describe('an item keyword follows its own discriminator', () => {
  it('the item keyword follows each own k', () => {
    const schema: BlueprintSchema = {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { k: { type: 'string' } },
            if: { properties: { k: { const: 'n' } }, required: ['k'] },
            then: { minProperties: 2 },
          },
        },
      },
    };
    const root = mount(schema, { list: [{ k: 'n' }, { k: 's' }] });
    const read = () =>
      ['/list/0', '/list/1'].map((path) => {
        const value = at(root, path)?.__schema__.schema;
        return value && typeof value === 'object'
          ? value.minProperties
          : 'absent';
      });
    const loaded = read();
    const first = write(root, '/list/1/k', 'n');
    const both = read();
    const second = write(root, '/list/0/k', 's');
    const swapped = read();
    const observed = { loaded, first, both, second, swapped };
    observations['B4'] = observed;
    expect(observed).toEqual({
      loaded: [2, undefined],
      first: 'ok',
      both: [2, 2],
      second: 'ok',
      swapped: [undefined, 2],
    });
  });
});

describe('first-occurrence templates and discarded provenance', () => {
  it('if form: depth 1 and depth 2 items share one template whose path is the first occurrence', () => {
    const root = mount(makeB2('if'), [
      {
        kind: 'strict',
        value: 'a',
        children: [{ kind: 'loose', value: 'a', children: [leaf('loose')] }],
      },
    ]);
    const depth1 = at(root, '/0/children/0');
    const depth2 = at(root, '/0/children/0/children/0');
    const ifGate = '#/$defs/item/if';
    const hostsAt = (path: string) =>
      readOccurrences(root, path)
        .filter((occurrence) => occurrence.schemaPath === ifGate)
        .map((occurrence) => occurrence.hostPath);
    const observed = {
      sharedTemplate: depth1?.blueprintNode === depth2?.blueprintNode,
      templatePath: depth2?.blueprintNode.path,
      depth1ArrayHosts: hostsAt('/0/children'),
      depth2ArrayHosts: hostsAt('/0/children/0/children'),
    };
    observations['fact 1'] = observed;
    // Model: the depth-2 array consumes the if introduced at its own parent item,
    // and its per-item edge references the item's own if in the item's frame.
    expect(observed).toEqual({
      sharedTemplate: true,
      templatePath: '/*/children/*',
      depth1ArrayHosts: ['/0', '/0/children/0'],
      depth2ArrayHosts: ['/0/children/0', '/0/children/0/children/0'],
    });
  });
});
