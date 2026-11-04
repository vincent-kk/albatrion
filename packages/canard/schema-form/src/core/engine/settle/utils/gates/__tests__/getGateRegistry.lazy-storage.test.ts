import { expect, it } from 'vitest';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import { getGateRegistry } from '../getGateRegistry';

/** A live gate-free object shares a nonbranchless runtime with a conditional sibling. */
const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string' },
    value: { type: 'string' },
    container: {
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: 500 }, (_, index) => [
          `field_${index}`,
          { type: 'string' },
        ]),
      ),
    },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
};

it('registers 500 gate-free edges without allocating memo or edge Maps', () => {
  const { root: parent } = createTestTree(schema);
  const entry = parent.blueprintNode.childEntries.find(
    (entry) => entry.name === 'container',
  )!;
  const root = parent.runtime.nodeFactory(entry, parent, parent.runtime);
  const registry = getGateRegistry(root.runtime);
  const OriginalMap = globalThis.Map;
  let allocations = 0;
  class CountingMap<K, V> extends OriginalMap<K, V> {
    constructor(entries?: Iterable<readonly [K, V]> | null) {
      super(entries);
      allocations++;
    }
  }
  try {
    globalThis.Map = CountingMap;
    registry.register(root);
    registry.register(root);
  } finally {
    globalThis.Map = OriginalMap;
  }
  expect(registry.occurrenceCount(root.path)).toBe(0);
  expect(registry.hasRegisteredPathKind(root.path, 'object')).toBe(true);
  expect(registry.hasRegisteredPathKind('/absent', 'string')).toBe(false);
  expect(allocations).toBe(0);
});

it('binds an indirect gate after empty registration and removes its invalidation', () => {
  const { root: parent } = createTestTree(schema);
  const entry = parent.blueprintNode.childEntries.find(
    (entry) => entry.name === 'container',
  )!;
  const root = parent.runtime.nodeFactory(entry, parent, parent.runtime);
  const gate = parent.blueprintNode.declarations.flatMap(
    (declaration) => declaration.gates,
  )[0];
  const registry = getGateRegistry(root.runtime);
  registry.register(root);
  expect(registry.occurrenceCount(root.path)).toBe(0);
  const occurrence = registry.locate(root, gate);
  expect(occurrence.gate).toBe(gate);
  expect(occurrence.predicate).toBeDefined();
  expect(registry.locate(root, gate)).toBe(occurrence);
  expect(registry.occurrenceCount(root.path)).toBe(1);
  expect(
    registry.mayChangeAt(
      occurrence.evaluationHostPath,
      new Set([occurrence.watchPaths[0]]),
      new Set(['']),
    ),
  ).toBe(true);
  registry.remove(root);
  expect(registry.occurrenceCount(root.path)).toBe(0);
  expect(registry.hasRegisteredPathKind(root.path, 'object')).toBeUndefined();
  expect(
    registry.mayChangeAt(
      occurrence.evaluationHostPath,
      new Set([occurrence.watchPaths[0]]),
      new Set(['']),
    ),
  ).toBe(false);
  expect(registry.locate(root, gate)).not.toBe(occurrence);
});

it('allocates only two registration Maps across the 502-node conditional fixture', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      kind: { type: 'string', default: 'a' },
      ...Object.fromEntries(
        Array.from({ length: 500 }, (_, index) => [
          `field_${index}`,
          { type: 'string' },
        ]),
      ),
    },
    if: { properties: { kind: { const: 'a' } } },
    then: { properties: { field_0: { minLength: 2 } } },
  });
  const registry = getGateRegistry(root.runtime);
  const nodes = [
    root,
    ...root.blueprintNode.childEntries.map((entry) =>
      root.runtime.nodeFactory(entry, root, root.runtime),
    ),
  ];
  const OriginalMap = globalThis.Map;
  let allocations = 0;
  class CountingMap<K, V> extends OriginalMap<K, V> {
    constructor(entries?: Iterable<readonly [K, V]> | null) {
      super(entries);
      if (
        new Error().stack?.split('\n')[2]?.includes('GateRegistry.register')
      )
        allocations++;
    }
  }
  try {
    globalThis.Map = CountingMap;
    for (const node of nodes) registry.register(node);
  } finally {
    globalThis.Map = OriginalMap;
  }
  expect(nodes).toHaveLength(502);
  expect(registry.occurrenceCount('')).toBe(1);
  expect(registry.occurrenceCount('/field_0')).toBe(1);
  expect(registry.occurrenceCount('/field_499')).toBe(0);
  expect(registry.hasRegisteredPathKind('/field_499', 'string')).toBe(true);
  expect(allocations).toBe(2);
});
