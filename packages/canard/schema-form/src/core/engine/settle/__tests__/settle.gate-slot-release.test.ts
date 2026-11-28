import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import {
  dispatchBatch,
  dispatchClear,
  dispatchInsert,
  dispatchMount,
  dispatchPush,
  dispatchRemove,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { getGateRegistry } from '../utils/gates/getGateRegistry';

/*
 * A decision lives while it is referenced and is released with its last owner: a slot that
 * leaves the array takes its decision references with it, so the registry after any arrangement
 * holds what a fresh load of the same value holds.
 */

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

const at = (root: Node, path: string): Node => {
  let node: Node | undefined = root;
  for (const name of path.split('/').slice(1))
    node = node?.__childrenByName__?.[name];
  if (!node) throw new Error(`Missing node ${path}`);
  return node;
};

/** Registrations, references, decisions and watches, read structurally as the gate registry tests do. */
const readRegistry = (root: Node) => {
  const registry: unknown = getGateRegistry(root.runtime);
  const field = (name: string): unknown =>
    registry && typeof registry === 'object'
      ? Reflect.get(registry, name)
      : undefined;
  const byPath = field('byPath');
  const canonical = field('canonical');
  const byLocation = field('byLocation');
  let references = 0;
  if (byPath instanceof Map)
    for (const registration of byPath.values()) {
      const occurrences: unknown = Reflect.get(registration, 'occurrences');
      if (Array.isArray(occurrences)) references += occurrences.length;
    }
  const decisions: string[] = [];
  let watches = 0;
  if (canonical instanceof Map)
    for (const occurrence of canonical.values()) {
      decisions.push(String(Reflect.get(occurrence, 'key')));
      const watchPaths: unknown = Reflect.get(occurrence, 'watchPaths');
      if (Array.isArray(watchPaths)) watches += watchPaths.length;
    }
  let located = 0;
  if (byLocation instanceof Map)
    for (const entries of byLocation.values())
      if (entries instanceof Set) located += entries.size;
  return {
    registrations: byPath instanceof Map ? [...byPath.keys()].sort() : [],
    references,
    decisions: decisions.sort(),
    watches,
    located,
  };
};

/** Each row narrows itself with its own `if` and selects a branch by `kind`. */
const itemGates: BlueprintSchema = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string' },
          v: { type: 'string' },
        },
        if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
        then: { properties: { v: { minLength: 2 } } },
        oneOf: [
          {
            controls: { active: './kind === "a"' },
            properties: { a: { type: 'string', default: 'A' } },
          },
          {
            controls: { active: './kind !== "a"' },
            properties: { b: { type: 'string', default: 'B' } },
          },
        ],
      },
    },
  },
};

const row = (index: number) => ({
  kind: index % 2 ? 'b' : 'a',
  v: `v${index}`,
});

const rows = (count: number) => Array.from({ length: count }, (_, i) => row(i));

/** Live registry, value and row schemas next to a fresh load of the same value. */
const againstFresh = (root: Node) => {
  const value = structuredClone(root.__value__);
  const fresh = mount(itemGates, value);
  const read = (form: Node) => {
    const list = at(form, '/rows');
    return {
      value: form.__value__,
      schemas: (list.children ?? []).map((item) => item.__schema__.schema),
      registry: readRegistry(form),
    };
  };
  return [read(root), read(fresh)] as const;
};

describe('a leaving slot releases its decision references', () => {
  it('after 200 rows are cleared and one is pushed, the registry holds one row', () => {
    const root = mount(itemGates, { rows: rows(200) });
    const list = at(root, '/rows');
    dispatchClear(list);
    dispatchPush(list, row(0));
    const [live, fresh] = againstFresh(root);
    expect(live.registry).toEqual(fresh.registry);
    expect(live).toEqual(fresh);
  });

  it.each([
    ['remove', (list: Node): void => void dispatchRemove(list, 1)],
    [
      'move',
      (list: Node) => {
        const moved = dispatchRemove(list, 0);
        dispatchInsert(list, 2, moved);
      },
    ],
    [
      'swap by two writes',
      (list: Node) => {
        const first = structuredClone(at(list, '/0').__value__);
        const second = structuredClone(at(list, '/1').__value__);
        dispatchSetValue(at(list, '/0'), second);
        dispatchSetValue(at(list, '/1'), first);
      },
    ],
    [
      'clear then push',
      (list: Node) => {
        dispatchClear(list);
        dispatchPush(list, row(1));
      },
    ],
    [
      'a batch of those',
      (list: Node) =>
        dispatchBatch(list, () => {
          dispatchRemove(list, 1);
          const moved = dispatchRemove(list, 0);
          dispatchInsert(list, 1, moved);
          dispatchSetValue(at(list, '/0'), row(1));
          dispatchClear(list);
          dispatchPush(list, row(0));
          dispatchPush(list, row(1));
        }),
    ],
  ] as const)('%s leaves the state of a fresh load', (_name, arrange) => {
    const root = mount(itemGates, { rows: rows(4) });
    arrange(at(root, '/rows'));
    const [live, fresh] = againstFresh(root);
    expect(live.registry).toEqual(fresh.registry);
    expect(live).toEqual(fresh);
  });
});
