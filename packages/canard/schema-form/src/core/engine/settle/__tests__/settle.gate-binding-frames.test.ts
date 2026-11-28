import { existsSync, writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import {
  dispatchBatch,
  dispatchMount,
  dispatchPush,
  dispatchRemove,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { getGateRegistry } from '../utils/gates/getGateRegistry';

/*
 * Gate binding at the frame where a condition is introduced: a root fragment, shared templates,
 * tuples and nested arrays, recursion edges, reads above a recursive item, aliases around a cycle,
 * moved items, convergence within one settlement and an item-local type conflict.
 */

const OUT =
  '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/b5781004-ec7c-4a1e-8b24-8f294a15778d/scratchpad/gb/results/';
const observations: Record<string, unknown> = {};
afterAll(() => {
  if (existsSync(OUT))
    writeFileSync(
      `${OUT}adversarial-${Date.now()}.json`,
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
  if (!node) throw new Error(`absent ${path}`);
  return node;
};

/** One keyword of a node's effective schema; `absent` when the node is not live. */
const keyword = (root: Node, path: string, name: string): unknown => {
  const schema = at(root, path)?.__schema__.schema;
  if (!schema || typeof schema !== 'object') return 'absent';
  return Reflect.get(schema, name);
};

const keywords = (root: Node, paths: readonly string[], name: string) =>
  paths.map((path) => keyword(root, path, name));

/** Registered references at one owner: `schemaPath @ host ^ location <watches>`. */
const references = (root: Node, owner: string): string[] => {
  const byPath: unknown = Reflect.get(getGateRegistry(root.runtime), 'byPath');
  const registration: unknown =
    byPath instanceof Map ? byPath.get(owner) : undefined;
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
    const schemaPath =
      gate && typeof gate === 'object' ? Reflect.get(gate, 'schemaPath') : '';
    const watches = read('watchPaths');
    return `${String(schemaPath)} @ ${String(read('hostPath'))} ^ ${String(
      read('evaluationHostPath'),
    )} <${Array.isArray(watches) ? watches.join(',') : ''}>`;
  });
};

/** Distinct (condition, host) decisions over every live registration. */
const decisions = (root: Node, schemaPath: string): string[] => {
  const byPath: unknown = Reflect.get(getGateRegistry(root.runtime), 'byPath');
  const keys = new Set<string>();
  if (byPath instanceof Map)
    for (const registration of byPath.values()) {
      const occurrences: unknown = Reflect.get(registration, 'occurrences');
      if (!Array.isArray(occurrences)) continue;
      for (const occurrence of occurrences) {
        const gate: unknown = Reflect.get(occurrence, 'gate');
        if (
          gate &&
          typeof gate === 'object' &&
          Reflect.get(gate, 'schemaPath') === schemaPath
        )
          keys.add(String(Reflect.get(occurrence, 'hostPath')));
      }
    }
  return [...keys].sort();
};

describe('a root fragment', () => {
  it('root evaluates once and every row consumes it', () => {
    const rows = Array.from({ length: 8 }, () => ({ kind: 'b', v: 'x' }));
    const root = mount(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: { kind: { type: 'string' }, v: { type: 'string' } },
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
        ],
      },
      { flag: false, rows },
    );
    const targets = rows.map((_, index) => `/rows/${index}/v`);
    const mounted = keywords(root, targets, 'minLength');
    const referencesAt7 = references(root, '/rows/7');
    dispatchSetValue(need(root, '/flag'), true);
    const flipped = keywords(root, targets, 'minLength');
    dispatchSetValue(need(root, '/flag'), false);
    const restored = keywords(root, targets, 'minLength');
    const rootDecisions = decisions(root, '#/allOf/0/controls/active');
    observations['(d)'] = {
      mounted,
      flipped,
      restored,
      referencesAt7,
      rootDecisions,
    };
    expect({ mounted, flipped, restored, rootDecisions }).toEqual({
      mounted: targets.map(() => undefined),
      flipped: targets.map(() => 2),
      restored: targets.map(() => undefined),
      rootDecisions: [''],
    });
  });
});

const aliasTarget = {
  type: 'object',
  properties: { kind: { type: 'string' }, value: { type: 'string' } },
  if: { properties: { kind: { const: 'strict' } }, required: ['kind'] },
  then: { properties: { value: { minLength: 3 } } },
} as const;

describe('aliases', () => {
  it('a shared template binds its local gate per frame and an overlay stays at its frame', () => {
    const root = mount(
      {
        type: 'object',
        properties: {
          left: {
            allOf: [{ $ref: '#/$defs/D' }],
            if: { properties: { kind: { const: 'L' } }, required: ['kind'] },
            then: { properties: { value: { maxLength: 9 } } },
          },
          right: { $ref: '#/$defs/D' },
        },
        $defs: { D: aliasTarget },
      },
      {
        left: { kind: 'strict', value: 'a' },
        right: { kind: 'L', value: 'a' },
      },
    );
    const read = () => ({
      left: [
        keyword(root, '/left/value', 'minLength'),
        keyword(root, '/left/value', 'maxLength'),
      ],
      right: [
        keyword(root, '/right/value', 'minLength'),
        keyword(root, '/right/value', 'maxLength'),
      ],
    });
    const mounted = read();
    dispatchSetValue(need(root, '/left/kind'), 'L');
    const leftL = read();
    dispatchSetValue(need(root, '/right/kind'), 'strict');
    const rightStrict = read();
    const hosts = {
      left: references(root, '/left'),
      right: references(root, '/right'),
    };
    observations['(f)'] = { mounted, leftL, rightStrict, hosts };
    expect({ mounted, leftL, rightStrict }).toEqual({
      mounted: { left: [3, undefined], right: [undefined, undefined] },
      leftL: { left: [undefined, 9], right: [undefined, undefined] },
      rightStrict: { left: [undefined, 9], right: [3, undefined] },
    });
  });
});

describe('tuple and nested arrays', () => {
  it('the item at /1/4/2 reads its own kind and each selector consumes its own edge', () => {
    const root = mount(
      {
        type: 'array',
        prefixItems: [
          { type: 'string' },
          {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: { kind: { type: 'string' } },
                if: {
                  properties: { kind: { const: 'n' } },
                  required: ['kind'],
                },
                then: { minProperties: 2 },
              },
            },
          },
        ],
      },
      ['s', [[], [], [], [], [{ kind: 's' }, { kind: 's' }, { kind: 'n' }]]],
    );
    const targets = ['/1/4/0', '/1/4/1', '/1/4/2'];
    const mounted = keywords(root, targets, 'minProperties');
    dispatchSetValue(need(root, '/1/4/0/kind'), 'n');
    dispatchSetValue(need(root, '/1/4/2/kind'), 's');
    const written = keywords(root, targets, 'minProperties');
    const hosts = {
      array: references(root, '/1/4'),
      item: references(root, '/1/4/2'),
    };
    observations['(g)'] = { mounted, written, hosts };
    expect({
      mounted,
      written,
      itemHosts: hosts.item.filter((reference) => reference.includes('/if')),
    }).toEqual({
      mounted: [undefined, undefined, 2],
      written: [2, undefined, undefined],
      itemHosts: [
        '#/prefixItems/1/items/items/if @ /1/4/2 ^ /1/4/2 </1/4/2/kind>',
      ],
    });
  });
});

const branchItem = (recursive: Record<string, unknown>) => ({
  type: 'object',
  controls: { discriminator: 'kind' },
  properties: {
    kind: { type: 'string' },
    value: { type: 'string' },
    ...recursive,
  },
  oneOf: [
    { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
    { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
    { properties: { kind: { const: 'strict' } } },
  ],
});

describe('two recursion edges', () => {
  const ref = { type: 'array', items: { $ref: '#/$defs/item' } };
  const schema: BlueprintSchema = {
    type: 'array',
    items: { $ref: '#/$defs/item' },
    $defs: {
      item: {
        ...branchItem({ left: ref, right: ref }),
        if: { properties: { kind: { const: 'strict' } }, required: ['kind'] },
        then: {
          properties: {
            right: { items: { properties: { value: { maxLength: 4 } } } },
            left: { items: { properties: { value: { maxLength: 6 } } } },
          },
        },
      },
    },
  };
  const leaf = (kind: string) => ({ kind, value: 'a', left: [], right: [] });
  it.each([
    ['left', 'right', 4],
    ['right', 'left', 6],
  ] as const)(
    'parent under %s, children under %s',
    (outer, inner, maxLength) => {
      const parent = {
        ...leaf('strict'),
        [inner]: [leaf('x'), leaf('y')],
      };
      const root = mount(schema, [{ ...leaf('x'), [outer]: [parent] }]);
      const target = `/0/${outer}/0/${inner}/1`;
      const observed = {
        value: [
          keyword(root, `${target}/value`, 'minLength'),
          keyword(root, `${target}/value`, 'maxLength'),
        ],
        sibling: keyword(root, `/0/${outer}/0/${inner}/0/value`, 'maxLength'),
        outer: keyword(root, `/0/${outer}/0/value`, 'maxLength'),
        hosts: references(root, target),
      };
      observations[`E1 ${outer}`] = observed;
      expect({
        value: observed.value,
        sibling: observed.sibling,
        outer: observed.outer,
      }).toEqual({
        value: [5, maxLength],
        sibling: maxLength,
        outer: undefined,
      });
    },
  );
});

describe('a read above a recursive item', () => {
  it('host stays the item, the location is its parent, and only that subtree changes', () => {
    const root = mount(
      {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          rows: { type: 'array', items: { $ref: '#/$defs/item' } },
        },
        $defs: {
          item: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              value: { type: 'string' },
              children: { type: 'array', items: { $ref: '#/$defs/item' } },
            },
            allOf: [
              {
                controls: { active: '../../enabled === true' },
                properties: { value: { minLength: 3 } },
              },
            ],
          },
        },
      },
      {
        enabled: false,
        rows: [
          {
            enabled: true,
            value: 'a',
            children: [{ enabled: false, value: 'a', children: [] }],
          },
          {
            enabled: false,
            value: 'a',
            children: [{ enabled: false, value: 'a', children: [] }],
          },
        ],
      },
    );
    const targets = [
      '/rows/0/value',
      '/rows/0/children/0/value',
      '/rows/1/value',
      '/rows/1/children/0/value',
    ];
    const mounted = keywords(root, targets, 'minLength');
    dispatchSetValue(need(root, '/rows/1/enabled'), true);
    const second = keywords(root, targets, 'minLength');
    dispatchSetValue(need(root, '/rows/0/enabled'), false);
    const first = keywords(root, targets, 'minLength');
    const hosts = references(root, '/rows/0/children/0');
    observations.E2 = { mounted, second, first, hosts };
    expect({
      mounted,
      second,
      first,
      hosts: hosts.filter((reference) => reference.includes('active')),
    }).toEqual({
      mounted: [undefined, 3, undefined, undefined],
      second: [undefined, 3, undefined, 3],
      first: [undefined, undefined, undefined, 3],
      hosts: [
        '#/$defs/item/allOf/0/controls/active @ /rows/0/children/0 ^ /rows/0 </rows/0/enabled>',
      ],
    });
  });
});

describe('an alias inside and outside a cycle', () => {
  it('a standalone-only overlay never enters the forest', () => {
    const children = { type: 'array', items: { $ref: '#/$defs/item' } };
    const root = mount(
      {
        type: 'object',
        properties: {
          standalone: {
            $ref: '#/$defs/item',
            if: { properties: { kind: { const: 'x' } }, required: ['kind'] },
            then: {
              properties: {
                children: {
                  items: { properties: { value: { maxLength: 4 } } },
                },
              },
            },
          },
          forest: { type: 'array', items: { $ref: '#/$defs/item' } },
        },
        $defs: { item: branchItem({ children }) },
      },
      {
        standalone: {
          kind: 'x',
          value: 'a',
          children: [{ kind: 'y', value: 'a', children: [] }],
        },
        forest: [
          {
            kind: 'x',
            value: 'a',
            children: [{ kind: 'y', value: 'a', children: [] }],
          },
        ],
      },
    );
    const read = (path: string) => [
      keyword(root, path, 'minLength'),
      keyword(root, path, 'maxLength'),
    ];
    const observed = {
      standaloneChild: read('/standalone/children/0/value'),
      forestParent: read('/forest/0/value'),
      forestChild: read('/forest/0/children/0/value'),
      discriminatorHosts: decisions(root, '#/$defs/item'),
    };
    observations.E4 = {
      ...observed,
      hosts: {
        standaloneChild: references(root, '/standalone/children/0'),
        forestChild: references(root, '/forest/0/children/0'),
      },
    };
    expect({
      standaloneChild: observed.standaloneChild,
      forestParent: observed.forestParent,
      forestChild: observed.forestChild,
    }).toEqual({
      standaloneChild: [5, 4],
      forestParent: [3, undefined],
      forestChild: [5, undefined],
    });
  });
});

describe('a moved item', () => {
  it('a retained item keeps its own branch and a replacement does not inherit its memo', () => {
    const root = mount(
      {
        type: 'object',
        properties: { list: { type: 'array', items: branchItem({}) } },
      },
      {
        list: [
          { kind: 'x', value: 'a' },
          { kind: 'y', value: 'a' },
        ],
      },
    );
    const read = () =>
      ['/list/0/value', '/list/1/value'].map((path) =>
        keyword(root, path, 'minLength'),
      );
    const mounted = read();
    dispatchRemove(need(root, '/list'), 0);
    const moved = read();
    dispatchPush(need(root, '/list'), { kind: 'x', value: 'a' });
    const pushed = read();
    dispatchSetValue(need(root, '/list/1/kind'), 'y');
    const rewritten = read();
    dispatchSetValue(need(root, '/list/0/kind'), 'x');
    const firstX = read();
    const hosts = {
      first: references(root, '/list/0'),
      second: references(root, '/list/1'),
    };
    observations.E5 = { mounted, moved, pushed, rewritten, firstX, hosts };
    expect({ mounted, moved, pushed, rewritten, firstX }).toEqual({
      mounted: [3, 5],
      moved: [5, 'absent'],
      pushed: [5, 3],
      rewritten: [5, 5],
      firstX: [3, 5],
    });
  });
});

describe('convergence within one settlement', () => {
  it('false, true, false in one batch leaves no true schema', () => {
    const item = {
      type: 'object',
      properties: {
        kind: { type: 'string' },
        value: { type: 'string' },
        children: { type: 'array', items: { $ref: '#/$defs/item' } },
      },
      if: { properties: { kind: { const: 'strict' } }, required: ['kind'] },
      then: {
        properties: {
          children: { items: { properties: { value: { minLength: 3 } } } },
        },
      },
    };
    const root = mount(
      { type: 'array', items: { $ref: '#/$defs/item' }, $defs: { item } },
      [
        {
          kind: 'loose',
          value: 'a',
          children: [{ kind: 'loose', value: 'a', children: [] }],
        },
      ],
    );
    dispatchBatch(root, () => {
      dispatchSetValue(need(root, '/0/kind'), 'strict');
      dispatchSetValue(need(root, '/0/kind'), 'loose');
    });
    const batched = keyword(root, '/0/children/0/value', 'minLength');
    dispatchBatch(root, () => {
      dispatchSetValue(need(root, '/0/kind'), 'loose');
      dispatchSetValue(need(root, '/0/kind'), 'strict');
    });
    const reversed = keyword(root, '/0/children/0/value', 'minLength');
    observations.E6 = { batched, reversed };
    expect({ batched, reversed }).toEqual({ batched: undefined, reversed: 3 });
  });
});

/** Object item whose own `if` gives it `type: 'string'` when `k` is `x`: an authoring conflict. */
const conflictList: BlueprintSchema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { k: { type: 'string' } },
        if: { properties: { k: { const: 'x' } }, required: ['k'] },
        then: { type: 'string' },
      },
    },
  },
};

/**
 * Mount the conflict list with a recording reporter and read what a consumer observes.
 * @param value - Load value
 * @returns `attempt` runs one operation and records a thrown error; `read` reports thrown codes,
 * delivered records, diagnostics, the stored value and the first item's effective schema
 */
const observeConflict = (value: unknown) => {
  const reports: string[] = [];
  const { root, runtime } = createDispatchTree(
    conflictList,
    value,
    createTestValidator(),
    {
      hasConsumer: () => true,
      report: (record) =>
        reports.push(`${record.level} ${record.code} ${record.path ?? ''}`),
    },
  );
  runtime.validationMode = ValidationMode.None;
  const thrown: string[] = [];
  const attempt = (where: string, run: () => void) => {
    try {
      run();
    } catch (error) {
      const code = error instanceof Error ? Reflect.get(error, 'code') : error;
      const path =
        error instanceof Error
          ? Reflect.get(Object(Reflect.get(error, 'details')), 'path')
          : undefined;
      thrown.push(`${where} ${String(code)} ${String(path ?? '')}`);
    }
  };
  attempt('load', () =>
    dispatchMount(root, value, undefined, { deferValidation: true }),
  );
  const read = () => {
    const item = at(root, '/list/0');
    return {
      thrown: [...thrown],
      reports: [...reports],
      status: runtime.diagnostics.status,
      cause: Reflect.get(runtime.diagnostics, 'cause'),
      value: root.__value__,
      itemType: Reflect.get(Object(item?.__schema__.schema), 'type'),
      itemConflict: item?.__schema__.hasTypeConflict,
    };
  };
  return { root, attempt, read };
};

describe('an item-local type conflict', () => {
  it('load, a write reaching the same state, and a later push report the same conflict', () => {
    const loaded = observeConflict({ list: [{ k: 'x' }] });
    const viaLoad = loaded.read();
    loaded.attempt('push', () =>
      dispatchPush(need(loaded.root, '/list'), { k: 'y' }),
    );
    const loadThenPush = loaded.read();
    const written = observeConflict({ list: [{ k: 'y' }] });
    written.attempt('write', () =>
      dispatchSetValue(need(written.root, '/list/0/k'), 'x'),
    );
    const viaWrite = written.read();
    written.attempt('push', () =>
      dispatchPush(need(written.root, '/list'), { k: 'y' }),
    );
    const writeThenPush = written.read();
    observations.M1 = { viaLoad, viaWrite, loadThenPush, writeThenPush };
    const { thrown: loadThrown, reports: loadReports, ...loadState } = viaLoad;
    const {
      thrown: writeThrown,
      reports: writeReports,
      ...writeState
    } = viaWrite;
    expect(writeState).toEqual(loadState);
    expect(writeThrown.map((line) => line.replace(/^write /, ''))).toEqual(
      loadThrown.map((line) => line.replace(/^load /, '')),
    );
    expect(writeReports).toEqual(loadReports);
    const { thrown: pushThrownAfterLoad, ...afterLoadPush } = loadThenPush;
    const { thrown: pushThrownAfterWrite, ...afterWritePush } = writeThenPush;
    expect(afterWritePush).toEqual(afterLoadPush);
    expect(pushThrownAfterWrite.slice(writeThrown.length)).toEqual(
      pushThrownAfterLoad.slice(loadThrown.length),
    );
  });
});
