import { afterEach, describe, expect, it, vi } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import {
  dispatchMount,
  dispatchSetValue,
  readFieldNodeRevision,
  subscribeFieldNode,
} from '../../write';
import * as selection from '../utils/compute/dirtyChildren';
import { DirtyPathSet } from '../utils/scratch/DirtyPathSet';

afterEach(() => vi.restoreAllMocks());

/** Build a finite bulk schema with four children per host and string leaves. */
const nested = (depth: number, derive = false): BlueprintSchema =>
  depth === 0
    ? {
        type: 'string',
        default: 'before',
        ...(derive ? { controls: { derived: 'undefined' } } : {}),
      }
    : {
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: 4 }, (_, index) => [
            'n' + index,
            nested(depth - 1, derive && index === 0),
          ]),
        ),
      };

/** Replace every leaf while retaining the shape and all current child names. */
const changed = (value: unknown): unknown =>
  value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value).map(([name, child]) => [name, changed(child)]),
      )
    : String(value) + '-changed';

/** Observe path bookkeeping only during the supplied synchronous write. */
const measure = (root: DispatchTestNode, write: () => void) => {
  const add = vi.spyOn(DirtyPathSet.prototype, 'add');
  const consume = vi.spyOn(DirtyPathSet.prototype, 'consume');
  const children = vi.spyOn(selection, 'dirtyChildren');
  try {
    write();
    return {
      adds: add.mock.contexts.filter(
        (dirty) => dirty === root.runtime.settlementScratch?.dirtyPaths,
      ).length,
      consumes: consume.mock.calls.length,
      childLists: children.mock.calls.length,
    };
  } finally {
    add.mockRestore();
    consume.mockRestore();
    children.mockRestore();
  }
};

/** Record the live tree in its existing document order. */
const nodesOf = (node: DispatchTestNode): DispatchTestNode[] => [
  node,
  ...(node.children ?? []).flatMap(nodesOf),
];

// filid:contract settle-write-epoch
describe('whole-write epoch scheduling', () => {
  it.each([2, 4])(
    'uses constant path work and no dirty child arrays at depth %i',
    (depth) => {
      const { root } = createDispatchTree(nested(depth));
      dispatchMount(root, undefined);
      for (let round = 0; round < 2; round++) {
        const next = changed(root.emit);
        const work = measure(root, () => dispatchSetValue(root, next));
        expect(root.emit).toEqual(next);
        expect(work.adds).toBe(0);
        expect(work.consumes).toBe(0);
        expect(work.childLists).toBe(0);
      }
    },
  );

  it('preserves ordered payloads, revisions and values against forced fallback, including same leaves', () => {
    const run = (fallback: boolean) => {
      const { root } = createDispatchTree(nested(3, fallback));
      dispatchMount(root, undefined);
      const nodes = nodesOf(root);
      const log: unknown[] = [];
      for (const node of nodes)
        subscribeFieldNode(node, (event) => log.push([node.path, event]));
      const next = changed(root.emit);
      dispatchSetValue(root, next);
      dispatchSetValue(root, root.emit);
      const branch = root.children![1];
      dispatchSetValue(branch, changed(branch.emit));
      return {
        log,
        local: root.local,
        emit: root.emit,
        revisions: nodes.map((node) => [
          node.path,
          readFieldNodeRevision(node),
        ]),
      };
    };
    expect(run(false)).toEqual(run(true));
  });

  it('retains exactly 5461 consumes on the real partial-write bulk path', () => {
    const { root } = createDispatchTree(nested(6));
    dispatchMount(root, undefined);
    const next = changed(root.emit);
    const work = measure(root, () =>
      dispatchSetValue(root, next, WriteOption.Merge),
    );
    expect(work.consumes).toBe(5461);
    expect(root.emit).toEqual(next);
  });

  it('does not compute unchanged leaves or traverse a sibling subtree', () => {
    const { root } = createDispatchTree(nested(3));
    dispatchMount(root, undefined);
    const sibling = root.children![3];
    const previous = sibling.emit;
    const host = root.children![0];
    const unchanged = host.children![0];
    const revision = readFieldNodeRevision(unchanged);
    dispatchSetValue(host, host.emit);
    expect(readFieldNodeRevision(unchanged)).toBe(revision);
    expect(sibling.emit).toBe(previous);
    expect(root.emit).toEqual(root.local);
  });

  it.each<[string, BlueprintSchema]>([
    [
      'gate',
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          v: { type: 'number', controls: { active: '../flag' } },
        },
      },
    ],
    [
      'derive',
      {
        type: 'object',
        properties: {
          v: { type: 'number' },
          d: { type: 'number', controls: { derived: '../v + 1' } },
        },
      },
    ],
    [
      'virtual',
      {
        type: 'object',
        properties: { v: { type: 'number' } },
        options: { virtual: { tuple: { fields: ['v'] } } },
      },
    ],
  ])('falls back for %s', (_, schema) => {
    const { root } = createDispatchTree(schema);
    dispatchMount(root, { flag: true, v: 1 });
    expect(
      measure(root, () => dispatchSetValue(root, { flag: true, v: 2 })).adds,
    ).toBeGreaterThan(0);
  });

  it('falls back after a nested array count changes, retaining earlier marked siblings', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        first: { type: 'number' },
        rows: { type: 'array', items: { type: 'number' } },
      },
    });
    dispatchMount(root, { first: 1, rows: [1, 2] });
    const next = { first: 2, rows: [3, 4, 5] };
    expect(
      measure(root, () => dispatchSetValue(root, next)).adds,
    ).toBeGreaterThan(0);
    expect(root.emit).toEqual(next);
    dispatchSetValue(root, { first: 3, rows: [4, 5, 6] });
    expect(root.emit).toEqual({ first: 3, rows: [4, 5, 6] });
  });

  it('falls back for partial writes and preserves omitted keys', () => {
    const { root } = createDispatchTree(nested(2));
    dispatchMount(root, undefined);
    const previous = root.children![1].emit;
    expect(
      measure(root, () =>
        dispatchSetValue(root, { n0: { n0: 'partial' } }, WriteOption.Merge),
      ).adds,
    ).toBeGreaterThan(0);
    expect(root.children![1].emit).toBe(previous);
  });

  it('falls back for latent sources even when replacement prunes them', () => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const { root } = createDispatchTree(nested(2));
    dispatchMount(root, undefined);
    root.runtime.latentRaw.set(JSON.stringify(['/ghost', 'unknown']), 42);
    const next = changed(root.emit);
    expect(
      measure(root, () => dispatchSetValue(root, next)).adds,
    ).toBeGreaterThan(0);
    expect(root.emit).toEqual(next);
  });

  it('falls back for missing keys and wrong-kind hosts without losing preceding writes', () => {
    const { root } = createDispatchTree(nested(2));
    dispatchMount(root, undefined);
    expect(
      measure(root, () =>
        dispatchSetValue(root, { n0: { n0: 'changed' }, n1: null }),
      ).adds,
    ).toBeGreaterThan(0);
    expect(Object(root.emit).n0.n0).toBe('changed');
    expect(Object(root.emit).n1).toBeNull();
  });
});
