import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

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

it.each<MoveCase>([
  { layout: 'items', operation: 'insert', expected: INSERT_ENTRIES },
  { layout: 'items', operation: 'remove', expected: REMOVE_ENTRIES },
  { layout: 'prefixItems', operation: 'insert', expected: INSERT_ENTRIES },
  { layout: 'prefixItems', operation: 'remove', expected: REMOVE_ENTRIES },
])(
  'W4 absent $layout slots preserve base latent order and metadata on $operation',
  ({ layout, operation }) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show', unsetOnInactive: false },
      properties: {
        v: { type: 'string', controls: { unsetOnInactive: false } },
      },
    };
    const { root } = createDispatchTree({
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
    const frozen = readFieldNodeInactiveValues(root);
    expect(frozen).toEqual(
      ['first', 'second', 'third'].map((value, index) => ({
        path: `/list/${index}/v`,
        value,
      })),
    );
    if (operation === 'insert') dispatchInsert(list, 0, { v: 'new' });
    else dispatchRemove(list, 0);
    const values =
      operation === 'insert'
        ? ['new', 'first', 'second', 'third']
        : ['second', 'third'];
    expect(readFieldNodeInactiveValues(root)).toEqual(
      values.map((value, index) => ({ path: `/list/${index}/v`, value })),
    );
    expect(frozen).toEqual(
      ['first', 'second', 'third'].map((value, index) => ({
        path: `/list/${index}/v`,
        value,
      })),
    );
    expect(list.children).toEqual([]);
    expect(root.local).toEqual({
      show: false,
      list: operation === 'insert' ? [{}, {}, {}, {}] : [{}, {}],
    });
    expect(root.emit).toEqual(root.local);
  },
);
