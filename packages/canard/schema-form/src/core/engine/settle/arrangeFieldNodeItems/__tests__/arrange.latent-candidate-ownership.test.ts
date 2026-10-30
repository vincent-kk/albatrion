import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchClear,
  dispatchInsert,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { hasRetainedSlotOwnSource } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { readRetainedSlotRaw } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';
import * as slotApplication from '../utils/arraySlots/applyArraySlots';

afterEach(() => vi.restoreAllMocks());

describe('tuple source-slot candidate ownership', () => {
  it.each([1, 2] as const)(
    'depth %s entering candidate prefers its retained source over tuple replay',
    (depth) => {
      const { root } = createDispatchTree(replayTupleSchema(depth));
      dispatchMount(root, {
        kind: 'string',
        list: [depth === 1 ? { v: 'live' } : { box: { v: 'live' } }],
      });
      const list = getDispatchNode(root, 'list');
      const names = depth === 1 ? ['v'] : ['box', 'v'];
      const source = getDispatchNode(list, '0');
      dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
      expect(getDispatchNode(source, ...names).raw).toBe(37);
      dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
      expect(
        readRetainedSlotRaw(root, '/list/0/' + names.join('/'), 'number'),
      ).toBe(37);
      root.runtime.disableAutomaticWrites = true;
      dispatchInsert(list, 0, {});
      const moved = getDispatchNode(list, '1');
      expect(source.detached).toBe(true);
      expect(moved).not.toBe(source);
      expect(getDispatchNode(moved, ...names).raw).toBe(37);
      expect(moved.local).toEqual(depth === 1 ? { v: 37 } : { box: { v: 37 } });
      expect(moved.emit).toEqual(moved.local);
    },
  );

  it.each(['insert', 'remove'] as const)(
    '[control] single-candidate tuple %s preserves its retained source',
    (operation) => {
      const item: BlueprintSchema = {
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          v: { type: 'string', controls: { active: '../show' } },
        },
      };
      const { root } = createDispatchTree({
        type: 'array',
        prefixItems: [item, item, item],
      });
      dispatchMount(root, [
        { show: true, v: 'first' },
        { show: true, v: 'second' },
      ]);
      dispatchSetValue(getDispatchNode(root, '0', 'show'), false);
      dispatchSetValue(getDispatchNode(root, '1', 'show'), false);
      expect(root.blueprintNode.hasCandidateDescendants).toBeUndefined();
      expect(
        readFieldNodeInactiveValues(root).find(
          (entry) => entry.path === '/0/v' && typeof entry.value === 'string',
        )?.value,
      ).toBe('first');
      const apply = slotApplication.applyArraySlots;
      const application = vi
        .spyOn(slotApplication, 'applyArraySlots')
        .mockImplementation((host, plan, context) => {
          const result = apply(host, plan, context);
          return result;
        });
      if (operation === 'insert') dispatchInsert(root, 0, {});
      else dispatchRemove(root, 0);
      expect(application).toHaveBeenCalledOnce();
      const destination = operation === 'insert' ? '1' : '0';
      const expected = operation === 'insert' ? 'first' : 'second';
      expect(
        readFieldNodeInactiveValues(root).find(
          (entry) =>
            entry.path === `/${destination}/v` &&
            typeof entry.value === 'string',
        )?.value,
      ).toBe(expected);
      dispatchSetValue(getDispatchNode(root, destination, 'show'), true);
      expect(getDispatchNode(root, destination, 'v').raw).toBe(expected);
    },
  );

  it.each([
    { kind: 'string', operation: 'insert' },
    { kind: 'number', operation: 'insert' },
    { kind: 'string', operation: 'remove' },
    { kind: 'number', operation: 'remove' },
  ] satisfies readonly {
    kind: 'string' | 'number';
    operation: 'insert' | 'remove';
  }[])(
    '$operation before a latent $kind moves every candidate source',
    ({ kind, operation }) => {
      const { root } = createDispatchTree(tupleSchema());
      const value = kind === 'string' ? 'held' : 37;
      dispatchMount(root, { kind, list: [{ v: value }, { v: value }] });
      const list = getDispatchNode(root, 'list');
      const sourceIndex = operation === 'insert' ? 0 : 1;
      const destination = operation === 'insert' ? 1 : 0;
      const original = getDispatchNode(list, String(sourceIndex));
      dispatchSetValue(
        getDispatchNode(root, 'kind'),
        kind === 'string' ? 'number' : 'string',
      );
      expect(readRetainedSlotRaw(root, `/list/${sourceIndex}/v`, kind)).toBe(
        value,
      );

      if (operation === 'insert') dispatchInsert(list, 0, {});
      else dispatchRemove(list, 0);
      expect(original.detached).toBe(true);
      expect(getDispatchNode(list, String(destination))).not.toBe(original);
      expect(readRetainedSlotRaw(root, `/list/${destination}/v`, kind)).toBe(
        value,
      );

      if (operation === 'remove')
        expect(
          hasRetainedSlotOwnSource(root, `/list/${sourceIndex}/v`, kind),
        ).toBe(false);
      dispatchSetValue(getDispatchNode(root, 'kind'), kind);
      expect(getDispatchNode(list, String(destination), 'v').raw).toBe(value);
      expect(list.local).toEqual(
        operation === 'insert'
          ? [{}, { v: value }, { v: value }]
          : [{ v: value }],
      );
      expect(list.emit).toEqual(list.local);
      expect(root.runtime.loadSnapshot).toMatchObject({
        list:
          operation === 'insert'
            ? [{}, { v: value }, { v: value }]
            : [{ v: value }],
      });
    },
  );

  it.each(['insert', 'remove'] as const)(
    '%s carries several already-latent candidates through record recreation',
    (operation) => {
      const { root } = createDispatchTree(tupleSchema(true));
      dispatchMount(root, {
        kind: 'string',
        list: [{ v: 'first' }, { v: 'second' }],
      });
      const list = getDispatchNode(root, 'list');
      dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
      dispatchSetValue(getDispatchNode(root, 'kind'), 'none');
      const source = operation === 'insert' ? 0 : 1;
      const destination = operation === 'insert' ? 1 : 0;
      expect(readRetainedSlotRaw(root, `/list/${source}/v`, 'string')).toBe(
        source === 0 ? 'first' : 'second',
      );
      expect(readRetainedSlotRaw(root, `/list/${source}/v`, 'number')).toBe(37);
      if (operation === 'insert') dispatchInsert(list, 0, {});
      else dispatchRemove(list, 0);
      expect(
        readRetainedSlotRaw(root, `/list/${destination}/v`, 'string'),
      ).toBe(source === 0 ? 'first' : 'second');
      expect(
        readRetainedSlotRaw(root, `/list/${destination}/v`, 'number'),
      ).toBe(37);

      dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
      expect(getDispatchNode(list, String(destination), 'v').raw).toBe(
        source === 0 ? 'first' : 'second',
      );
      dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
      expect(getDispatchNode(list, String(destination), 'v').raw).toBe(37);
    },
  );

  it.each(['remove', 'pop', 'clear'] as const)(
    '[control] true %s destroys all latent candidates in a slot',
    (operation) => {
      const { root } = createDispatchTree(tupleSchema(true));
      dispatchMount(root, { kind: 'string', list: [{ v: 'held' }] });
      const list = getDispatchNode(root, 'list');
      dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
      dispatchSetValue(getDispatchNode(root, 'kind'), 'none');
      expect(readRetainedSlotRaw(root, '/list/0/v', 'string')).toBe('held');
      expect(readRetainedSlotRaw(root, '/list/0/v', 'number')).toBe(37);
      if (operation === 'remove') dispatchRemove(list, 0);
      else if (operation === 'pop') dispatchPop(list);
      else dispatchClear(list);
      expect(hasRetainedSlotOwnSource(root, '/list/0/v', 'string')).toBe(false);
      expect(hasRetainedSlotOwnSource(root, '/list/0/v', 'number')).toBe(false);

      root.runtime.disableAutomaticWrites = true;
      dispatchPush(list, {});
      dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
      expect(list.local).toEqual([{}]);
      dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
      expect(list.local).toEqual([{}]);
    },
  );
});

/**
 * Declare independently bound tuple objects with string and number property candidates.
 * @param numberDefault - Whether automatic entry supplies a second candidate source
 * @returns Three tuple positions whose differing blueprints require record recreation
 */
const tupleSchema = (numberDefault = false): BlueprintSchema => {
  const item: BlueprintSchema = {
    type: 'object',
    allOf: [
      {
        controls: { active: '../../kind === "string"' },
        properties: { v: { type: 'string' } },
      },
      {
        controls: { active: '../../kind === "number"' },
        properties: {
          v: { type: 'number', ...(numberDefault ? { default: 37 } : {}) },
        },
      },
    ],
  };
  return {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      list: { type: 'array', prefixItems: [item, item, item] },
    },
  };
};

/**
 * Activate the other stored property candidate when a slot moves to position one.
 * @param depth - Number of property levels from the tuple item to the candidate
 * @returns Tuple whose recreated destination selects a different source kind
 */
const replayTupleSchema = (depth: 1 | 2): BlueprintSchema => {
  const path = depth === 1 ? '../../kind' : '../../../kind';
  const items = [false, true].map((reversed): BlueprintSchema => {
    const property: BlueprintSchema = {
      type: 'object',
      allOf: [
        {
          controls: {
            active: `${path} === "${reversed ? 'number' : 'string'}"`,
          },
          properties: { v: { type: 'string' } },
        },
        {
          controls: {
            active: `${path} === "${reversed ? 'string' : 'number'}"`,
          },
          properties: { v: { type: 'number', default: 37 } },
        },
      ],
    };
    return depth === 1
      ? property
      : { type: 'object', properties: { box: property } };
  });
  return {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      list: { type: 'array', prefixItems: items },
    },
  };
};
