import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import { FieldNodeEventType } from '../../../record';
import type { FieldNodeDelivery } from '../../../record';
import type { Validator } from '../../../validation';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
  dispatchValidate,
  subscribeFieldNode,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { hasRetainedSlotOwnSource } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { readRetainedSlotRaw } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

describe('moving tuple slot-root candidate sources', () => {
  it.each([
    [
      'depth 0 insert string live restores number source',
      'retained',
      'insert',
      'string',
    ],
    [
      'depth 0 insert number live restores string source',
      'retained',
      'insert',
      'number',
    ],
    [
      'depth 0 remove string live restores number source',
      'retained',
      'remove',
      'string',
    ],
    [
      'depth 0 remove number live restores string source',
      'retained',
      'remove',
      'number',
    ],
    [
      '[control] depth 0 insert string live without number source keeps composed input',
      'absent',
      'insert',
      'string',
    ],
    [
      '[control] depth 0 insert number live without string source keeps composed input',
      'absent',
      'insert',
      'number',
    ],
    [
      '[control] depth 0 remove string live without number source keeps composed input',
      'absent',
      'remove',
      'string',
    ],
    [
      '[control] depth 0 remove number live without string source keeps composed input',
      'absent',
      'remove',
      'number',
    ],
    [
      '[control] single-candidate depth 0 insert string live keeps composed input',
      'single',
      'insert',
      'string',
    ],
    [
      '[control] single-candidate depth 0 insert number live keeps composed input',
      'single',
      'insert',
      'number',
    ],
    [
      '[control] single-candidate depth 0 remove string live keeps composed input',
      'single',
      'remove',
      'string',
    ],
    [
      '[control] single-candidate depth 0 remove number live keeps composed input',
      'single',
      'remove',
      'number',
    ],
  ] satisfies readonly [
    string,
    'retained' | 'absent' | 'single',
    'insert' | 'remove',
    'string' | 'number',
  ][])('%s', async (_name, mode, operation, live) => {
    const validationInputs: unknown[] = [];
    const validator: Validator = {
      compile: () => (value) => {
        validationInputs.push(value);
        return null;
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      slotRootSchema(operation, live, mode === 'single'),
      undefined,
      validator,
    );
    const liveValue = live === 'string' ? 'held' : 37;
    const other = live === 'string' ? 'number' : 'string';
    const stored = live === 'string' ? 37 : 'held';
    const sourceIndex = operation === 'insert' ? 0 : 1;
    const destination = operation === 'insert' ? 1 : 0;
    const initial = mode === 'retained' ? stored : liveValue;
    const initialInput = {
      a: mode !== 'retained',
      b: mode === 'retained',
      list: operation === 'insert' ? [initial] : [stored, initial],
    };
    dispatchMount(root, initialInput);
    if (mode === 'retained') {
      dispatchSetValue(getDispatchNode(root, 'b'), false);
      dispatchSetValue(getDispatchNode(root, 'a'), true);
    }
    const list = getDispatchNode(root, 'list');
    const original = getDispatchNode(list, String(sourceIndex));
    expect(original.raw).toBe(liveValue);

    if (mode === 'retained') {
      expect(readRetainedSlotRaw(root, `/list/${sourceIndex}`, other)).toBe(
        stored,
      );
    } else
      expect(
        hasRetainedSlotOwnSource(root, `/list/${sourceIndex}`, other),
      ).toBe(false);
    if (mode === 'single')
      expect(list.blueprintNode.hasCandidateDescendants).toBeUndefined();
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    const movedPath = `/list/${destination}`;
    const inserted = live === 'string' ? 'new' : 99;
    if (operation === 'insert') dispatchInsert(list, 0, inserted);
    else dispatchRemove(list, 0);
    const moved = getDispatchNode(list, String(destination));
    const expectedValue =
      mode === 'retained'
        ? stored
        : other === 'string'
          ? String(liveValue)
          : liveValue;
    const expected = {
      a: true,
      b: false,
      list:
        operation === 'insert' ? [inserted, expectedValue] : [expectedValue],
    };
    expect(original.detached).toBe(true);
    expect(moved).not.toBe(original);
    expect(moved.blueprintNode.kind).toBe(other);
    expect(moved.raw).toBe(expectedValue);
    expect(root.local).toEqual(expected);
    expect(root.emit).toEqual(expected);
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({
      current: { local: expected, emit: expected },
    });
    await dispatchValidate(root);
    expect(validationInputs.at(-1)).toEqual(expected);
    expect(root.runtime.loadSnapshot).toEqual({
      ...initialInput,
      list: operation === 'insert' ? [inserted, initial] : [initial],
    });
    if (mode === 'single')
      expect(readFieldNodeInactiveValues(root).length).toBe(0);
    if (mode !== 'retained') return;

    expect(hasRetainedSlotOwnSource(root, movedPath, other)).toBe(false);

    expect(readRetainedSlotRaw(root, movedPath, live)).toBe(liveValue);

    if (operation === 'insert') dispatchRemove(list, 0);
    else dispatchInsert(list, 0, stored);
    const restored = getDispatchNode(list, String(sourceIndex));
    expect(restored.raw).toBe(liveValue);
    expect(readRetainedSlotRaw(root, `/list/${sourceIndex}`, other)).toBe(
      stored,
    );

    dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'b'), true);
    expect(getDispatchNode(list, String(sourceIndex)).raw).toBe(stored);
    expect(readRetainedSlotRaw(root, `/list/${sourceIndex}`, live)).toBe(
      liveValue,
    );

    dispatchSetValue(getDispatchNode(root, 'b'), false);
    dispatchSetValue(getDispatchNode(root, 'a'), true);
    expect(getDispatchNode(list, String(sourceIndex)).raw).toBe(liveValue);
    const returned = {
      a: true,
      b: false,
      list: operation === 'insert' ? [liveValue] : [stored, liveValue],
    };
    expect(root.local).toEqual(returned);
    expect(root.emit).toEqual(returned);
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({
      current: { local: returned, emit: returned },
    });
    await dispatchValidate(root);
    expect(validationInputs.at(-1)).toEqual(returned);
    expect(readRetainedSlotRaw(root, `/list/${sourceIndex}`, other)).toBe(
      stored,
    );
  });
});

/**
 * Declare a candidate slot next to a differently typed single-candidate destination.
 * @param operation - Which neighbor disappears or is inserted before the source
 * @param live - Kind whose default becomes the source slot's current live value
 * @param single - Whether both tuple positions have just one unconditional kind
 * @returns Root with independent candidate gates and a tuple requiring recreation
 */
const slotRootSchema = (
  operation: 'insert' | 'remove',
  live: 'string' | 'number',
  single: boolean,
): BlueprintSchema => {
  const current: BlueprintSchema = {
    type: live,
    default: live === 'string' ? 'held' : 37,
  };
  const other: BlueprintSchema = {
    type: live === 'string' ? 'number' : 'string',
  };
  const positions =
    operation === 'insert' ? [current, other] : [other, current];
  return {
    type: 'object',
    properties: {
      a: { type: 'boolean' },
      b: { type: 'boolean' },
      list: {
        type: 'array',
        ...(single
          ? { prefixItems: positions }
          : {
              allOf: [
                { controls: { active: '../a' }, prefixItems: positions },
                {
                  controls: { active: '../b' },
                  prefixItems:
                    operation === 'insert' ? [other] : [other, other],
                },
              ],
            }),
      },
    },
  };
};
