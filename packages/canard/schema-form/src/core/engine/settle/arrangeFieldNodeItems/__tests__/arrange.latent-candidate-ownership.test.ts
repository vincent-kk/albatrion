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
import * as slotApplication from '../utils/arraySlots/applyArraySlots';
import * as rekeying from '../utils/rekey/rekeyArrayRuntimePaths';

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
      const numberKey = JSON.stringify([
        '/list/0/' + names.join('/'),
        'number',
      ]);
      expect(root.runtime.latentRaw.get(numberKey)).toBe(37);
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
    '[control] single-candidate tuple %s creates no replay marker or retained-source query',
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
        root.runtime.latentRaw.get(JSON.stringify(['/0/v', 'string'])),
      ).toBe('first');
      const under = vi.spyOn(root.runtime.latentRaw.pathIndex, 'under');
      const rekey = rekeying.rekeyArrayRuntimePaths;
      vi.spyOn(rekeying, 'rekeyArrayRuntimePaths').mockImplementation(
        (...args) => {
          rekey(...args);
          under.mockClear();
        },
      );
      const apply = slotApplication.applyArraySlots;
      const application = vi
        .spyOn(slotApplication, 'applyArraySlots')
        .mockImplementation((host, plan, context) => {
          const result = apply(host, plan, context);
          expect(under).not.toHaveBeenCalled();
          for (const distribution of context.distributedInputs.values())
            expect(distribution.preserveLatent).toBeUndefined();
          return result;
        });
      if (operation === 'insert') dispatchInsert(root, 0, {});
      else dispatchRemove(root, 0);
      expect(application).toHaveBeenCalledOnce();
      const destination = operation === 'insert' ? '1' : '0';
      const expected = operation === 'insert' ? 'first' : 'second';
      expect(
        root.runtime.latentRaw.get(
          JSON.stringify([`/${destination}/v`, 'string']),
        ),
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
      const key = JSON.stringify([`/list/${sourceIndex}/v`, kind]);
      const movedKey = JSON.stringify([`/list/${destination}/v`, kind]);
      expect(root.runtime.latentRaw.get(key)).toBe(value);
      const metadata = root.runtime.latentRawMetadata?.get(key);
      expect(metadata).toBeDefined();
      if (!metadata)
        throw new Error('Expected latent metadata for the source slot');
      if (operation === 'insert') dispatchInsert(list, 0, {});
      else dispatchRemove(list, 0);
      expect(original.detached).toBe(true);
      expect(getDispatchNode(list, String(destination))).not.toBe(original);
      expect(root.runtime.latentRaw.get(movedKey)).toBe(value);
      expect(root.runtime.latentRawMetadata?.get(movedKey)).toEqual({
        ...metadata,
        path: `/list/${destination}/v`,
        order: [metadata.order[0], destination, ...metadata.order.slice(2)],
      });
      if (operation === 'remove')
        expect(root.runtime.latentRaw.has(key)).toBe(false);
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
      const stringKey = JSON.stringify([`/list/${destination}/v`, 'string']);
      const numberKey = JSON.stringify([`/list/${destination}/v`, 'number']);
      const sourceString = JSON.stringify([`/list/${source}/v`, 'string']);
      const sourceNumber = JSON.stringify([`/list/${source}/v`, 'number']);
      expect(root.runtime.latentRaw.get(sourceString)).toBe(
        source === 0 ? 'first' : 'second',
      );
      expect(root.runtime.latentRaw.get(sourceNumber)).toBe(37);
      if (operation === 'insert') dispatchInsert(list, 0, {});
      else dispatchRemove(list, 0);
      expect(root.runtime.latentRaw.get(stringKey)).toBe(
        source === 0 ? 'first' : 'second',
      );
      expect(root.runtime.latentRaw.get(numberKey)).toBe(37);
      expect(root.runtime.latentRawMetadata?.get(stringKey)?.path).toBe(
        `/list/${destination}/v`,
      );
      expect(root.runtime.latentRawMetadata?.get(numberKey)?.path).toBe(
        `/list/${destination}/v`,
      );
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
      const stringKey = JSON.stringify(['/list/0/v', 'string']);
      const numberKey = JSON.stringify(['/list/0/v', 'number']);
      expect(root.runtime.latentRaw.get(stringKey)).toBe('held');
      expect(root.runtime.latentRaw.get(numberKey)).toBe(37);
      if (operation === 'remove') dispatchRemove(list, 0);
      else if (operation === 'pop') dispatchPop(list);
      else dispatchClear(list);
      expect(root.runtime.latentRaw.has(stringKey)).toBe(false);
      expect(root.runtime.latentRaw.has(numberKey)).toBe(false);
      expect(root.runtime.latentRawMetadata?.has(stringKey)).toBe(false);
      expect(root.runtime.latentRawMetadata?.has(numberKey)).toBe(false);
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
