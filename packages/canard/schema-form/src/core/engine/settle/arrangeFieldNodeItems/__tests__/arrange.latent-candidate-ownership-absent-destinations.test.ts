import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import { getItemEntries } from '../../../blueprint';
import type { BlueprintNode, BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import * as rekeying from '../utils/rekey/rekeyArrayRuntimePaths';

/** One literal latent entry in the order observed on base 24964a8bc. */
interface ExpectedEntry {
  /** Original slot whose source moves; -1 identifies the inserted value. */
  source: number;
  /** Destination template selected during subsequent input distribution. */
  destination: number;
  /** Existing encoded path/token identity. */
  key: string;
  /** Absolute metadata address after the structural move. */
  path: string;
  /** Authored document order after the structural move. */
  order: readonly number[];
  /** Source retained at the encoded identity. */
  value: string;
}

/** Base inserts retain moved entries before adding the newly inserted source. */
const INSERT_ENTRIES: readonly ExpectedEntry[] = [
  {
    source: 0,
    destination: 1,
    key: '["/list/1/v","string"]',
    path: '/list/1/v',
    order: [1, 1, 0],
    value: 'first',
  },
  {
    source: 1,
    destination: 2,
    key: '["/list/2/v","string"]',
    path: '/list/2/v',
    order: [1, 2, 0],
    value: 'second',
  },
  {
    source: 2,
    destination: 3,
    key: '["/list/3/v","string"]',
    path: '/list/3/v',
    order: [1, 3, 0],
    value: 'third',
  },
  {
    source: -1,
    destination: 0,
    key: '["/list/0/v","string"]',
    path: '/list/0/v',
    order: [1, 0, 0],
    value: 'new',
  },
];

/** Base removals retain the two surviving sources in their original relative order. */
const REMOVE_ENTRIES: readonly ExpectedEntry[] = [
  {
    source: 1,
    destination: 0,
    key: '["/list/0/v","string"]',
    path: '/list/0/v',
    order: [1, 0, 0],
    value: 'second',
  },
  {
    source: 2,
    destination: 1,
    key: '["/list/1/v","string"]',
    path: '/list/1/v',
    order: [1, 1, 0],
    value: 'third',
  },
];

/** Statically enumerable slot-kind and verb combinations for the base registration rule. */
interface MoveCase {
  /** Repeated or tuple item declaration. */
  layout: 'items' | 'prefixItems';
  /** Structural verb applied before all absent source slots. */
  operation: 'insert' | 'remove';
  /** Ordered latent result measured on the pinned base product. */
  expected: readonly ExpectedEntry[];
}

afterEach(() => vi.restoreAllMocks());

it.each<MoveCase>([
  { layout: 'items', operation: 'insert', expected: INSERT_ENTRIES },
  { layout: 'items', operation: 'remove', expected: REMOVE_ENTRIES },
  { layout: 'prefixItems', operation: 'insert', expected: INSERT_ENTRIES },
  { layout: 'prefixItems', operation: 'remove', expected: REMOVE_ENTRIES },
])(
  'W4 absent $layout slots preserve base latent order and metadata on $operation',
  ({ layout, operation, expected }) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show', unsetOnInactive: false },
      properties: {
        v: { type: 'string', controls: { unsetOnInactive: false } },
      },
    };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        list:
          layout === 'items'
            ? { type: 'array', items: item }
            : { type: 'array', prefixItems: [item, item, item, item] },
      },
    });
    dispatchMount(root, {
      show: true,
      list: [{ v: 'first' }, { v: 'second' }, { v: 'third' }],
    });
    const list = getDispatchNode(root, 'list');
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    expect(list.children).toEqual([]);
    expect(root.blueprintNode.hasCandidateDescendants).toBeUndefined();
    const originals = [0, 1, 2].map((index) =>
      runtime.latentRawMetadata?.get(
        JSON.stringify([`/list/${index}/v`, 'string']),
      ),
    );
    for (const info of originals)
      expect(info?.exitLayers?.map((decision) => decision.clear)).toEqual([
        false,
      ]);
    const retained = expected.filter((entry) => entry.source >= 0);
    const originalRekey = rekeying.rekeyArrayRuntimePaths;
    const rekey = vi
      .spyOn(rekeying, 'rekeyArrayRuntimePaths')
      .mockImplementation((...args) => {
        originalRekey(...args);
        expect([...runtime.latentRaw]).toEqual(
          retained.map((entry) => [entry.key, entry.value]),
        );
        expect([...(runtime.latentRawMetadata?.keys() ?? [])]).toEqual(
          retained.map((entry) => entry.key),
        );
        for (const entry of retained) {
          const original = originals[entry.source];
          if (!original)
            throw new Error('Missing last-live source classification');
          const metadata = runtime.latentRawMetadata?.get(entry.key);
          expect(metadata).toEqual({
            path: entry.path,
            blueprintNode: original.blueprintNode,
            order: entry.order,
            exitLayers: original.exitLayers,
          });
          expect(metadata?.blueprintNode).toBe(original.blueprintNode);
          expect(metadata?.exitLayers).toBe(original.exitLayers);
          expect(
            metadata?.exitLayers?.map((decision) => decision.clear),
          ).toEqual([false]);
        }
      });
    if (operation === 'insert') dispatchInsert(list, 0, { v: 'new' });
    else dispatchRemove(list, 0);
    expect(rekey).toHaveBeenCalledOnce();
    expect([...runtime.latentRaw]).toEqual(
      expected.map((entry) => [entry.key, entry.value]),
    );
    expect([...(runtime.latentRawMetadata?.keys() ?? [])]).toEqual(
      expected.map((entry) => entry.key),
    );
    for (const entry of expected) {
      const metadata = runtime.latentRawMetadata?.get(entry.key);
      const blueprintNode = childTemplate(
        list.blueprintNode,
        entry.destination,
      );
      expect(metadata).toEqual({
        path: entry.path,
        blueprintNode,
        order: entry.order,
      });
      expect(metadata?.blueprintNode).toBe(blueprintNode);
      expect(metadata?.exitLayers).toBeUndefined();
    }
    expect(list.children).toEqual([]);
    expect(root.local).toEqual({
      show: false,
      list: operation === 'insert' ? [{}, {}, {}, {}] : [{}, {}],
    });
    expect(root.emit).toEqual(root.local);
  },
);

/**
 * Read the destination's authored string template without evaluating gates.
 * @param array - Analyzed array host containing the selected item declaration
 * @param index - Nonnegative destination slot covered by the test schema
 * @returns Its declared v template; throws if the schema omitted that child
 */
function childTemplate(array: BlueprintNode, index: number): BlueprintNode {
  const child = getItemEntries(array, index)[0]?.node.childEntries.find(
    (entry) => entry.name === 'v',
  )?.node;
  if (!child) throw new Error('Missing destination v declaration');
  return child;
}
