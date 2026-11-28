import { existsSync, writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it, vi } from 'vitest';

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

import { getGateRegistry } from '../utils/gates/getGateRegistry';

/*
 * Counts of gate predicate executions, schema records and node computations per operation.
 * Predicate executions are counted at `predicate.evaluate`; schema records at
 * `captureFieldNodeChange(node, '__schema__')`; computations at `updateOutput`, which every
 * node computation ends with. The wrappers forward unchanged.
 */

const counters = vi.hoisted(() => ({
  executions: [] as string[],
  schemaWrites: [] as { path: string; writer: string }[],
  visits: 0,
  arrayVisits: 0,
  outputs: 0,
  withWriter: false,
}));

vi.mock('../utils/output/updateOutput', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../utils/output/updateOutput')>();
  return {
    updateOutput: (...args: Parameters<typeof actual.updateOutput>) => {
      counters.outputs++;
      return actual.updateOutput(...args);
    },
  };
});

vi.mock(
  '../utils/compute/childSelection/selectEntryStep',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../utils/compute/childSelection/selectEntryStep')
      >();
    return {
      ...actual,
      selectEntryStep: (...args: Parameters<typeof actual.selectEntryStep>) => {
        counters.visits++;
        if (args[2].node.behavior.type === 'array') counters.arrayVisits++;
        return actual.selectEntryStep(...args);
      },
    };
  },
);

vi.mock(
  '../utils/gates/predicates/createGatePredicate',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../utils/gates/predicates/createGatePredicate')
      >();
    return {
      createGatePredicate: (
        ...args: Parameters<typeof actual.createGatePredicate>
      ) => {
        const predicate = actual.createGatePredicate(...args);
        const label = `${args[1].hostPath} ${args[1].gate.schemaPath}`;
        return {
          ...predicate,
          evaluate: (input: Parameters<typeof predicate.evaluate>[0]) => {
            counters.executions.push(label);
            return predicate.evaluate(input);
          },
        };
      },
    };
  },
);

const WRITERS = [
  'recordWheelStartSchemas',
  'recomposeOwnSchema',
  'selectEntryStep',
  'selectNodeSchema',
  'primeHost',
  'prepareFixedFirstHost',
  'composeNodeSchema',
];

vi.mock('../../record', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../record')>();
  return {
    ...actual,
    captureFieldNodeChange: (
      ...args: Parameters<typeof actual.captureFieldNodeChange>
    ) => {
      if (args[1] === '__schema__') {
        const stack = counters.withWriter ? (new Error().stack ?? '') : '';
        const writer =
          WRITERS.find((name) => stack.includes(name)) ??
          (counters.withWriter ? 'other' : '');
        counters.schemaWrites.push({ path: args[0].path, writer });
      }
      return actual.captureFieldNodeChange(...args);
    },
  };
});

const OUT =
  '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/b5781004-ec7c-4a1e-8b24-8f294a15778d/scratchpad/gb/results/';
const observations: Record<string, unknown> = {};
afterAll(() => {
  if (existsSync(OUT))
    writeFileSync(
      `${OUT}counts-${Date.now()}.json`,
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

const need = (root: Node, path: string): Node => {
  const node = at(root, path);
  if (!node) throw new Error(`Missing node ${path}`);
  return node;
};

const reset = () => {
  counters.executions.length = 0;
  counters.schemaWrites.length = 0;
  counters.visits = 0;
  counters.arrayVisits = 0;
  counters.outputs = 0;
};

/** Registered occurrences per owner: total and with a successful memo. */
const readOccurrenceCounts = (root: Node) => {
  const registry: unknown = getGateRegistry(root.runtime);
  const byPath: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'byPath')
      : undefined;
  let total = 0;
  let evaluated = 0;
  if (byPath instanceof Map)
    for (const registration of byPath.values()) {
      const occurrences: unknown = Reflect.get(registration, 'occurrences');
      if (!Array.isArray(occurrences)) continue;
      total += occurrences.length;
      for (const occurrence of occurrences)
        if (Reflect.get(occurrence, 'memo')) evaluated++;
    }
  const canonical: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'canonical')
      : undefined;
  let decisions = 0;
  if (canonical instanceof Map)
    for (const occurrence of canonical.values())
      if (Reflect.get(occurrence, 'memo')) decisions++;
  return {
    total,
    evaluated,
    decisions:
      canonical instanceof Map ? `${decisions}/${canonical.size}` : 'n/a',
  };
};

/** Gate hosts registered at one owner path. */
const readHosts = (root: Node, path: string) => {
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
    const gate: unknown =
      occurrence && typeof occurrence === 'object'
        ? Reflect.get(occurrence, 'gate')
        : undefined;
    const schemaPath =
      gate && typeof gate === 'object' ? Reflect.get(gate, 'schemaPath') : '';
    const hostPath =
      occurrence && typeof occurrence === 'object'
        ? Reflect.get(occurrence, 'hostPath')
        : '';
    return `${String(schemaPath)} @ ${String(hostPath)}`;
  });
};

const ITEM_PATH = /^\/rows\/\d+$/;
const snapshot = (match: RegExp = ITEM_PATH) => ({
  executions: counters.executions.length,
  itemSchemaRecords: counters.schemaWrites.filter((write) =>
    match.test(write.path),
  ).length,
  allSchemaRecords: counters.schemaWrites.length,
  visits: counters.visits,
  arrayVisits: counters.arrayVisits,
  outputs: counters.outputs,
});

/** Discriminator lane: N independent object items, one pure `if` on kind, `then` on the item. */
const laneC: BlueprintSchema = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { kind: { type: 'string' } },
        if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
        then: { minProperties: 2 },
      },
    },
  },
};

/** Same lane with an item discriminator: the branch decision writes `minProperties`. */
const laneCDiscriminator: BlueprintSchema = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: { kind: { type: 'string' }, note: { type: 'string' } },
        oneOf: [
          { properties: { kind: { const: 'a' } }, minProperties: 2 },
          { properties: { kind: { const: 'b' } } },
          { properties: { kind: { const: 'c' } } },
        ],
      },
    },
  },
};

describe('discriminator lane', () => {
  it.each([
    ['if', 1000],
    ['if', 5000],
    ['discriminator', 1000],
    ['discriminator', 5000],
  ] as const)(
    '%s N = %i: load, toggling write, same-decision write',
    (lane, count) => {
      reset();
      const root = mount(lane === 'if' ? laneC : laneCDiscriminator, {
        rows: Array.from({ length: count }, () => ({ kind: 'b' })),
      });
      const load = { ...snapshot(), occurrences: readOccurrenceCounts(root) };
      const target = `/rows/${count >> 1}`;
      reset();
      dispatchSetValue(need(root, `${target}/kind`), 'a');
      const toggle = snapshot();
      const toggled = (() => {
        const schema = at(root, target)?.__schema__.schema;
        return schema && typeof schema === 'object'
          ? schema.minProperties
          : 'absent';
      })();
      reset();
      // A discriminator decides per branch, so its same-decision write leaves kind alone.
      if (lane === 'if')
        dispatchSetValue(need(root, `/rows/${(count >> 1) + 1}/kind`), 'c');
      else dispatchSetValue(need(root, `/rows/${(count >> 1) + 1}/note`), 'n');
      const same = snapshot();
      const observed = { load, toggle, toggled, same };
      if (lane === 'discriminator')
        expect(toggle.executions).toBeLessThanOrEqual(3);
      observations[`C lane ${lane} ${count}`] = observed;
      expect(observed).toEqual({
        load: {
          executions: lane === 'if' ? count : expect.any(Number),
          itemSchemaRecords: expect.any(Number),
          allSchemaRecords: expect.any(Number),
          visits: expect.any(Number),
          outputs: expect.any(Number),
          arrayVisits: expect.any(Number),
          occurrences: {
            total: expect.any(Number),
            evaluated: expect.any(Number),
            decisions: expect.anything(),
          },
        },
        toggle: {
          executions: lane === 'if' ? 1 : expect.any(Number),
          itemSchemaRecords: 1,
          allSchemaRecords: lane === 'if' ? 1 : expect.any(Number),
          visits: expect.any(Number),
          outputs: expect.any(Number),
          arrayVisits: 0,
        },
        toggled: 2,
        same: {
          executions: lane === 'if' ? 1 : 0,
          itemSchemaRecords: 0,
          allSchemaRecords: 0,
          visits: expect.any(Number),
          outputs: expect.any(Number),
          arrayVisits: 0,
        },
      });
    },
  );
});

describe('plain array item gates', () => {
  it.each([
    [
      'discriminator',
      {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: { kind: { type: 'string' }, value: { type: 'string' } },
        oneOf: [
          { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
          { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
        ],
      },
    ],
    [
      'if',
      {
        type: 'object',
        properties: { kind: { type: 'string' }, value: { type: 'string' } },
        if: { properties: { kind: { const: 'y' } }, required: ['kind'] },
        then: { minProperties: 2, properties: { value: { minLength: 5 } } },
      },
    ],
  ] as const)(
    '%s item: which owner evaluates, with which host, and who writes the schema',
    (_, items) => {
      counters.withWriter = true;
      try {
        reset();
        const root = mount(
          { type: 'object', properties: { rows: { type: 'array', items } } },
          {
            rows: [
              { kind: 'x', value: 'a' },
              { kind: 'x', value: 'a' },
            ],
          },
        );
        const load = {
          executions: [...new Set(counters.executions)],
          writes: counters.schemaWrites.map(
            (entry) => `${entry.path} ${entry.writer}`,
          ),
        };
        reset();
        dispatchSetValue(need(root, '/rows/1/kind'), 'y');
        const written = {
          executions: [...new Set(counters.executions)],
          writes: counters.schemaWrites.map(
            (entry) => `${entry.path} ${entry.writer}`,
          ),
        };
        const hosts = {
          rows: readHosts(root, '/rows'),
          item: readHosts(root, '/rows/1'),
        };
        const schemas = ['/rows/0', '/rows/1', '/rows/1/value'].map((path) =>
          JSON.stringify(at(root, path)?.__schema__.schema),
        );
        observations[`fact 3 ${_}`] = { load, written, hosts, schemas };
        // Model case (e): the item's own gate is hosted at the item, not at a wildcard.
        expect(hosts.rows.some((host) => host.endsWith('/rows/*'))).toBe(false);
      } finally {
        counters.withWriter = false;
      }
    },
  );
});

const gatedRows: BlueprintSchema = {
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    other: { type: 'boolean' },
    note: { type: 'string' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { kind: { type: 'string' }, v: { type: 'string' } },
        if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
        then: { minProperties: 2 },
      },
    },
  },
  allOf: [
    {
      controls: { active: './flag === true' },
      properties: {
        rows: { items: { properties: { v: { minLength: 2 } } } },
      },
    },
    {
      controls: { active: './other === true' },
      properties: { note: { minLength: 2 } },
    },
  ],
};
const recursiveRows: BlueprintSchema = {
  type: 'array',
  items: { $ref: '#/$defs/row' },
  $defs: {
    row: {
      type: 'object',
      properties: {
        kind: { type: 'string' },
        v: { type: 'string' },
        children: { type: 'array', items: { $ref: '#/$defs/row' } },
      },
      if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
      then: { properties: { v: { minLength: 2 } } },
    },
  },
};
const plainForm: BlueprintSchema = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'number' },
    c: { type: 'object', properties: { d: { type: 'boolean' } } },
  },
};

describe('counts per operation', () => {
  it.each([1000, 5000])('gated rows N = %i', (count) => {
    reset();
    const root = mount(gatedRows, {
      flag: false,
      rows: Array.from({ length: count }, () => ({ kind: 'b', v: 'x' })),
    });
    const load = { ...snapshot(), occurrences: readOccurrenceCounts(root) };
    reset();
    dispatchSetValue(need(root, `/rows/${count >> 1}/kind`), 'a');
    const write = snapshot();
    const rowMatch = /^\/rows\/\d+(\/.*)?$/;
    reset();
    dispatchPush(need(root, '/rows'), { kind: 'a', v: 'x' });
    const pushed = {
      ...snapshot(rowMatch),
      outsideNewRow: counters.schemaWrites.filter(
        (entry) =>
          rowMatch.test(entry.path) && !entry.path.startsWith(`/rows/${count}`),
      ).length,
    };
    reset();
    dispatchSetValue(need(root, '/flag'), true);
    const flip = {
      ...snapshot(rowMatch),
      rowsWithRecords: new Set(
        counters.schemaWrites
          .filter((entry) => rowMatch.test(entry.path))
          .map((entry) => entry.path.split('/').slice(0, 3).join('/')),
      ).size,
      targets: [
        ...new Set(
          counters.schemaWrites
            .filter((entry) => rowMatch.test(entry.path))
            .map((entry) => entry.path.replace(/^\/rows\/\d+/, '/rows/*')),
        ),
      ],
    };
    reset();
    dispatchSetValue(need(root, '/other'), true);
    const flipNoRow = snapshot(rowMatch);
    reset();
    dispatchSetValue(need(root, '/note'), 'unrelated');
    const unrelated = snapshot(rowMatch);
    observations[`D gated ${count}`] = {
      load,
      write,
      pushed,
      flip,
      flipNoRow,
      unrelated,
    };
    expect({
      pushedOutsideNewRow: pushed.outsideNewRow,
      flipRows: flip.rowsWithRecords,
      flipNoRowRecords: flipNoRow.itemSchemaRecords,
      unrelatedRecords: unrelated.itemSchemaRecords,
    }).toEqual({
      pushedOutsideNewRow: 0,
      flipRows: count + 1,
      flipNoRowRecords: 0,
      unrelatedRecords: 0,
    });
  });

  it.each([1000, 5000])('recursive rows N = %i', (count) => {
    reset();
    const root = mount(
      recursiveRows,
      Array.from({ length: count }, () => ({
        kind: 'b',
        v: 'x',
        children: [],
      })),
    );
    const match = /^\/\d+(\/v)?$/;
    const load = {
      ...snapshot(match),
      occurrences: readOccurrenceCounts(root),
    };
    reset();
    dispatchSetValue(need(root, `/${count >> 1}/kind`), 'a');
    const write = {
      ...snapshot(match),
      paths: counters.schemaWrites.map((entry) => entry.path),
    };
    const minLength = (() => {
      const schema = at(root, `/${count >> 1}/v`)?.__schema__.schema;
      return schema && typeof schema === 'object' ? schema.minLength : 'absent';
    })();
    const target = `/${count >> 1}`;
    const fresh = mount(
      recursiveRows,
      Array.from({ length: count }, (_, index) => ({
        kind: index === count >> 1 ? 'a' : 'b',
        v: 'x',
        children: [],
      })),
    );
    const agreesWithFresh = [target, `${target}/v`].every(
      (path) =>
        JSON.stringify(at(root, path)?.__schema__.schema) ===
        JSON.stringify(at(fresh, path)?.__schema__.schema),
    );
    observations[`D recursive ${count}`] = {
      load,
      write,
      minLength,
      agreesWithFresh,
    };
    // Two affected targets in the written row: the row's own schema takes the `then`
    // contribution and its `v` takes minLength.
    expect({
      minLength,
      paths: write.paths,
      agreesWithFresh,
    }).toEqual({
      minLength: 2,
      paths: [`${target}/v`, target],
      agreesWithFresh: true,
    });
  });

  it('plain form without arrays or gates', () => {
    reset();
    const root = mount(plainForm, { a: 'x', b: 1, c: { d: true } });
    const load = { ...snapshot(/.*/), occurrences: readOccurrenceCounts(root) };
    reset();
    dispatchSetValue(need(root, '/a'), 'y');
    const write = snapshot(/.*/);
    observations['D plain'] = { load, write };
    expect({ load, write }).toEqual({
      load: {
        executions: 0,
        itemSchemaRecords: expect.any(Number),
        allSchemaRecords: expect.any(Number),
        visits: expect.any(Number),
        outputs: expect.any(Number),
        arrayVisits: expect.any(Number),
        occurrences: { total: 0, evaluated: 0, decisions: expect.anything() },
      },
      write: {
        executions: 0,
        itemSchemaRecords: 0,
        allSchemaRecords: 0,
        visits: expect.any(Number),
        outputs: expect.any(Number),
        arrayVisits: 0,
      },
    });
  });
});

const sharedParentRows: BlueprintSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { kind: { type: 'string' }, v: { type: 'string' } },
        allOf: [
          {
            controls: { active: '../../mode === "x"' },
            properties: { v: { minLength: 2 } },
          },
        ],
      },
    },
  },
};

describe('a shared-parent read invalidates N', () => {
  it.each([1000, 5000])('shared parent read N = %i', (count) => {
    reset();
    const root = mount(sharedParentRows, {
      mode: 'y',
      rows: Array.from({ length: count }, () => ({ kind: 'b', v: 'x' })),
    });
    const load = {
      ...snapshot(/^\/rows\/\d+\/v$/),
      occurrences: readOccurrenceCounts(root),
    };
    reset();
    dispatchSetValue(need(root, '/mode'), 'x');
    const flip = snapshot(/^\/rows\/\d+\/v$/);
    const flipped = [0, count >> 1, count - 1].map((index) => {
      const schema = at(root, `/rows/${index}/v`)?.__schema__.schema;
      return schema && typeof schema === 'object' ? schema.minLength : 'absent';
    });
    reset();
    dispatchSetValue(need(root, `/rows/${count >> 1}/kind`), 'c');
    const unrelated = snapshot(/^\/rows\/\d+\/v$/);
    observations[`step5 shared parent ${count}`] = {
      load,
      flip,
      flipped,
      unrelated,
    };
    expect({
      flipped,
      flipRecords: flip.itemSchemaRecords,
      unrelated: unrelated.executions,
    }).toEqual({
      flipped: [2, 2, 2],
      flipRecords: count,
      unrelated: 0,
    });
  });
});
