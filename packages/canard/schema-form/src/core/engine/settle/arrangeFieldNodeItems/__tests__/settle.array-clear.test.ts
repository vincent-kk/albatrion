import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import {
  FieldNodeEventType,
  indexFieldNodeWarning,
} from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { PathKeyedMap } from '@/schema-form/core/engine/utils/pathIndex/PathKeyedMap';
import {
  dispatchClear,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { updateCommittedRuleValue } from '../../utils/commit/updateCommittedRuleValue';
import { prunePerishedPaths } from '../../utils/transition/prunePerishedPaths';
import { clearArrayRuntimePaths } from '../utils/rekey/clearArrayRuntimePaths';
import { rekeyArrayRuntimePaths } from '../utils/rekey/rekeyArrayRuntimePaths';
import { compareArrayClear } from './fixtures/compareArrayClear';
import type { ClearStep } from './fixtures/compareArrayClear';
import { observePathStores } from './fixtures/observePathStores';

afterEach(() => vi.restoreAllMocks());
// The fixture counts one shipping tree's bulk cleanup calls and mutations.

/** Object items whose third field carries the given controls. */
const itemsWith = (controls: Record<string, unknown>): BlueprintSchema => ({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      key: { type: 'number' },
      field: { type: 'number', controls },
    },
  },
});

/** Clear, refill, clear again, pop a single item and remove(0) of a single item: every emptying step takes the length-0 path. */
const EMPTYING: readonly ClearStep[] = [
  { apply: (root) => dispatchClear(root), bulk: true },
  { apply: (root) => dispatchClear(root), bulk: false },
  { apply: (root) => dispatchPush(root, { key: 7, field: 3 }), bulk: false },
  { apply: (root) => dispatchPush(root, { key: 8 }), bulk: false },
  { apply: (root) => dispatchClear(root), bulk: true },
  { apply: (root) => dispatchPush(root, { key: 9, field: 4 }), bulk: false },
  { apply: (root) => dispatchPop(root), bulk: true },
  {
    apply: (root) => dispatchPush(root, { flag: false, field: 5 }),
    bulk: false,
  },
  { apply: (root) => dispatchRemove(root, 0), bulk: true },
];

/** Object items with values, latent gated fields, misfits and nested arrays. */
const MIXED_ITEMS = [
  { flag: true, key: 1, field: 10 },
  { flag: false, key: 2, field: 20 },
  { flag: true, key: 'wrong', field: 30 },
  { key: 4 },
];

// filid:contract settle-array-clear
describe('clear empties the host by host prefix with positional detached reads', () => {
  it('matches the predecessor on a static number array, including a refill and a single-item pop', () => {
    compareArrayClear(
      { type: 'array', items: { type: 'number' } },
      [5, 6, 7, 8, 9],
      [
        { apply: (root) => dispatchClear(root), bulk: true },
        { apply: (root) => dispatchPush(root, 1), bulk: false },
        { apply: (root) => dispatchPop(root), bulk: true },
        { apply: (root) => dispatchPush(root, 2), bulk: false },
        { apply: (root) => dispatchClear(root), bulk: true },
      ],
    );
  });

  it.each<[string, BlueprintSchema]>([
    ['plain object items', itemsWith({})],
    ['gate', itemsWith({ active: '../flag' })],
    ['expression', itemsWith({ readOnly: '../flag' })],
    ['derive', itemsWith({ derived: '../key + 1' })],
    ['watch', itemsWith({ watch: ['../key'] })],
  ])(
    'matches the predecessor with %s, misfits and latent fields',
    (_, schema) => {
      compareArrayClear(schema, MIXED_ITEMS, EMPTYING);
    },
  );

  it('matches the predecessor for nested object items beneath an object root', () => {
    const schema: BlueprintSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              show: { type: 'boolean' },
              hidden: { type: 'string', controls: { active: '../show' } },
              tags: { type: 'array', items: { type: 'number' } },
            },
          },
        },
      },
    };
    const list = (root: DispatchTestNode) =>
      root.children!.find((child) => child.name === 'list')!;
    compareArrayClear(
      schema,
      {
        title: 't',
        list: [
          { name: 'a', show: true, hidden: 'x', tags: [1, 2] },
          { name: 'b', show: false, hidden: 'y', tags: ['bad'] },
          { name: 'c', tags: [] },
        ],
      },
      [
        { apply: (root) => dispatchClear(list(root)), bulk: true },
        {
          apply: (root) =>
            dispatchPush(list(root), { name: 'd', show: false, hidden: 'z' }),
          bulk: false,
        },
        { apply: (root) => dispatchClear(list(root)), bulk: true },
      ],
      list,
    );
  });

  it('delivers only the host and its ancestors and retires every removed node without a delivery', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      },
    });
    root.runtime.validationMode = 0;
    dispatchMount(
      root,
      { list: [{ name: 'a' }, { name: 'b' }] },
      WriteOption.Overwrite,
      { deferValidation: true },
    );
    const host = root.children![0];
    const former = host.children!.flatMap((item) => [item, ...item.children!]);
    const ledgers = former.map((node) => ({ ...node.revisionLedger }));
    const delivered: [string, number][] = [];
    for (const node of [root, host, ...former])
      subscribeFieldNode(node, (event) => {
        delivered.push([node.path, event.type]);
      });
    dispatchClear(host);
    expect(delivered).toEqual([
      ['', FieldNodeEventType.UpdateValue],
      [
        '/list',
        FieldNodeEventType.UpdateValue |
          FieldNodeEventType.UpdateChildren |
          FieldNodeEventType.RequestRefresh,
      ],
    ]);
    expect(host.local).toEqual([]);
    for (let index = 0; index < former.length; index++) {
      const node = former[index];
      expect(node.detached).toBe(true);
      expect(node.active).toBe(false);
      expect(node.pendingDelivery).toBeUndefined();
      expect(node.pendingRevision).toBe(0);
      expect({ ...node.revisionLedger }).toEqual(ledgers[index]);
    }
    expect(root.runtime.detachedReads?.get(former[0])?.defaultValue).toEqual({
      name: 'a',
    });
    expect(root.runtime.detachedReads?.get(former[1])?.defaultValue).toBe('a');
    expect(root.runtime.detachedReads?.get(former[2])?.defaultValue).toEqual({
      name: 'b',
    });
  });
});

/**
 * Fill every path store of a fresh tree with entries at live, latent-only, out-of-range, named and ancestor positions.
 * @param latentOnly - Whether the position without a live item holds latent and metadata entries
 * @returns The tree runtime and the live item paths beneath the host `/list`
 */
const populate = (latentOnly: boolean) => {
  const { root } = createTestTree({ type: 'object', properties: {} });
  const runtime = root.runtime;
  const pair = (path: string) => JSON.stringify([path, 'string']);
  const rule = (source: string, target: string) =>
    JSON.stringify([source, 'a', 'b', 'c', 'd', target]);
  const paths = [
    '/list/0/a',
    '/list/2',
    '/list/5/x',
    '/list/name',
    '/list',
    '/other',
  ];
  if (latentOnly) paths.push('/list/1/a');
  runtime.literalStarRaw = new PathKeyedMap('pair');
  runtime.literalStarValuesMemo = new PathKeyedMap('path');
  runtime.literalStarRawMetadata = new PathKeyedMap('pair');
  runtime.committedDeclarationIds = new PathKeyedMap('pair');
  runtime.misfitsMemo = new PathKeyedMap('path');
  runtime.literalStarValueEntries = new PathKeyedMap('pair');
  for (const path of paths) {
    const key = pair(path);
    runtime.literalStarRaw.set(key, path);
    runtime.literalStarRawMetadata.set(key, {
      path,
      blueprintNode: root.blueprintNode,
      order: [],
    });
    runtime.committedDeclarationIds.set(key, [1]);
    runtime.misfitPaths.add(path);
    runtime.misfitsMemo.set(path, { commit: 0, paths: [path] });
    runtime.literalStarValuesMemo.set(path, [{ path, value: 1 }]);
    runtime.literalStarValueEntries.set(key, {
      value: 1,
      order: [],
      entry: { path, value: 1 },
    });
    const warning = JSON.stringify(['misfit', path]);
    (runtime.warningKeys ??= new Set()).add(warning);
    indexFieldNodeWarning(runtime, warning, path);
  }
  runtime.misfitsMemo.set('', { commit: 0, paths: [] });
  runtime.literalStarValuesMemo.set('', []);
  updateCommittedRuleValue(runtime, rule('/list/0/a', '/other'), 'set', 1);
  updateCommittedRuleValue(runtime, rule('/other', '/list/5/x'), 'set', 2);
  updateCommittedRuleValue(runtime, rule('/other', '/list/name'), 'set', 3);
  runtime.literalStarRawDirty = false;
  return { runtime, live: new Set(['/list/0', '/list/2']) };
};

describe('host-prefix path-store cleanup against per-position prune and re-key', () => {
  it.each([
    ['with latent entries at a position without a live item', true, 3],
    ['without latent-only positions', false, 3],
    ['with every position live', false, 1],
  ])('gives identical stores and lookups %s', (_, latentOnly, oldCount) => {
    const candidate = populate(latentOnly);
    const oracle = populate(latentOnly);
    const live = oldCount === 1 ? new Set(['/list/0']) : candidate.live;
    clearArrayRuntimePaths(candidate.runtime, '/list', oldCount, live);
    prunePerishedPaths(oracle.runtime, live);
    rekeyArrayRuntimePaths(
      oracle.runtime,
      '/list',
      Array.from({ length: oldCount }, (_, index) => ({
        previous: '/list/' + index,
      })),
    );
    expect(observePathStores(candidate.runtime, '/list')).toEqual(
      observePathStores(oracle.runtime, '/list'),
    );
    expect([...(candidate.runtime.warningKeys ?? [])]).toEqual([
      ...(oracle.runtime.warningKeys ?? []),
    ]);
  });
});
