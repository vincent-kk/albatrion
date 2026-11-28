import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
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

import { getGateRegistry } from '../utils/gates/getGateRegistry';

/*
 * Cost of gate binding: wall-clock per operation and retained heap per 1,000 rows. The label
 * of a run
 * is read from `results/cost-label.txt` so interleaved runs land in separate files.
 */

const OUT =
  '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/b5781004-ec7c-4a1e-8b24-8f294a15778d/scratchpad/gb/results/';
const label = existsSync(`${OUT}cost-label.txt`)
  ? readFileSync(`${OUT}cost-label.txt`, 'utf8').trim()
  : 'unlabelled';
const observations: Record<string, unknown> = {};
afterAll(() => {
  if (existsSync(OUT))
    writeFileSync(
      `${OUT}cost-${label}-${Date.now()}.json`,
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

const need = (root: Node, path: string): Node => {
  let node: Node | undefined = root;
  for (const name of path.split('/').slice(1))
    node = node?.__childrenByName__?.[name];
  if (!node) throw new Error(`Missing node ${path}`);
  return node;
};

const time = (run: () => void): number => {
  const start = performance.now();
  run();
  return Math.round((performance.now() - start) * 100) / 100;
};

/** Time a mount and keep the mounted root. */
const timeMount = (
  schema: BlueprintSchema,
  value: unknown,
): { load: number; tree: Node } => {
  const start = performance.now();
  const tree = mount(schema, value);
  return { load: Math.round((performance.now() - start) * 100) / 100, tree };
};

const laneIf: BlueprintSchema = {
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
const laneDiscriminator: BlueprintSchema = {
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

describe('cost per operation', () => {
  it.each([1000, 5000])('C if and discriminator N = %i', (count) => {
    for (const [lane, schema] of [
      ['if', laneIf],
      ['discriminator', laneDiscriminator],
    ] as const) {
      const { load, tree } = timeMount(schema, {
        rows: Array.from({ length: count }, () => ({ kind: 'b' })),
      });
      const write = time(() =>
        dispatchSetValue(need(tree, `/rows/${count >> 1}/kind`), 'a'),
      );
      observations[`C ${lane} ${count}`] = { load, write };
    }
    expect(true).toBe(true);
  });

  it.each([1000, 5000])('D gated rows N = %i', (count) => {
    const { load, tree } = timeMount(gatedRows, {
      flag: false,
      rows: Array.from({ length: count }, () => ({ kind: 'b', v: 'x' })),
    });
    const write = time(() =>
      dispatchSetValue(need(tree, `/rows/${count >> 1}/kind`), 'a'),
    );
    const push = time(() =>
      dispatchPush(need(tree, '/rows'), { kind: 'a', v: 'x' }),
    );
    const flip = time(() => dispatchSetValue(need(tree, '/flag'), true));
    const flipNoRow = time(() => dispatchSetValue(need(tree, '/other'), true));
    const unrelated = time(() =>
      dispatchSetValue(need(tree, '/note'), 'unrelated'),
    );
    observations[`D gated ${count}`] = {
      load,
      write,
      push,
      flip,
      flipNoRow,
      unrelated,
    };
    expect(true).toBe(true);
  });

  it.each([1000, 5000])('D recursive rows N = %i', (count) => {
    const { load, tree } = timeMount(
      recursiveRows,
      Array.from({ length: count }, () => ({
        kind: 'b',
        v: 'x',
        children: [],
      })),
    );
    const write = time(() =>
      dispatchSetValue(need(tree, `/${count >> 1}/kind`), 'a'),
    );
    observations[`D recursive ${count}`] = { load, write };
    expect(true).toBe(true);
  });

  it('D plain form', () => {
    const { load, tree } = timeMount(plainForm, {
      a: 'x',
      b: 1,
      c: { d: true },
    });
    const write = time(() => dispatchSetValue(need(tree, '/a'), 'y'));
    observations['D plain'] = { load, write };
    expect(true).toBe(true);
  });
});

/** Registered references and canonical decisions, read structurally so the base also answers. */
const readRegistryCounts = (root: Node) => {
  const registry: unknown = getGateRegistry(root.runtime);
  const byPath: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'byPath')
      : undefined;
  let references = 0;
  if (byPath instanceof Map)
    for (const registration of byPath.values()) {
      const occurrences: unknown = Reflect.get(registration, 'occurrences');
      if (Array.isArray(occurrences)) references += occurrences.length;
    }
  const canonical: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'canonical')
      : undefined;
  return {
    registrations: byPath instanceof Map ? byPath.size : 0,
    references,
    decisions: canonical instanceof Map ? canonical.size : 'n/a',
  };
};

/** Nodes holding a non-empty frame binding map; `n/a` where the build has no frame bindings. */
const readFrameCounts = async (root: Node) => {
  const module: unknown = await import(
    '../utils/gates/frames/readFrameBindings'
  ).catch(() => undefined);
  const read =
    module && typeof module === 'object'
      ? Reflect.get(module, 'readFrameBindings')
      : undefined;
  if (typeof read !== 'function') return 'n/a';
  let nodes = 0;
  let bindings = 0;
  const visit = (node: Node) => {
    const map: unknown = read(node);
    if (map instanceof Map && map.size > 0) {
      nodes++;
      bindings += map.size;
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return { nodes, bindings };
};

describe('retained heap per 1,000 rows', () => {
  it('gated rows and the if lane', async () => {
    setFlagsFromString('--expose_gc');
    const collect: unknown = runInNewContext('gc');
    const gc = () => {
      if (typeof collect === 'function') collect();
    };
    const measure = (schema: BlueprintSchema, value: () => unknown) => {
      const samples: number[] = [];
      let kept: Node | undefined;
      for (let round = 0; round < 3; round++) {
        kept = undefined;
        gc();
        const before = process.memoryUsage().heapUsed;
        kept = mount(schema, value());
        gc();
        samples.push(process.memoryUsage().heapUsed - before);
      }
      samples.sort((left, right) => left - right);
      if (!kept) throw new Error('No mounted root to measure');
      return { bytes: samples[1], root: kept };
    };
    for (const [lane, schema, value] of [
      [
        'gated rows',
        gatedRows,
        () => ({
          flag: true,
          rows: Array.from({ length: 1000 }, () => ({ kind: 'a', v: 'x' })),
        }),
      ],
      [
        'if lane',
        laneIf,
        () => ({ rows: Array.from({ length: 1000 }, () => ({ kind: 'a' })) }),
      ],
    ] as const) {
      const { bytes, root } = measure(schema, value);
      observations[`heap ${lane}`] = {
        bytesPer1000Rows: bytes,
        registry: readRegistryCounts(root),
        frames: await readFrameCounts(root),
      };
    }
    expect(true).toBe(true);
  });
});
