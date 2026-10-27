import { afterEach, describe, expect, it, vi } from 'vitest';

import { pinLatentBaseline } from '../../../../__tests__/fixtures/pinLatentBaseline';
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
import * as slotApplication from '../utils/arraySlots/applyArraySlots';

afterEach(() => vi.restoreAllMocks());

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
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
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
    const sourceKey = JSON.stringify([`/list/${sourceIndex}`, other]);
    const metadata = root.runtime.latentRawMetadata?.get(sourceKey);
    if (mode === 'retained') {
      expect(root.runtime.latentRaw.get(sourceKey)).toBe(stored);
      expect(metadata).toBeDefined();
    } else expect(root.runtime.latentRaw.has(sourceKey)).toBe(false);
    if (mode === 'single')
      expect(list.blueprintNode.hasCandidateDescendants).toBeUndefined();
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    const movedPath = `/list/${destination}`;
    const movedOwn = JSON.stringify([movedPath, other]);
    const movedLive = JSON.stringify([movedPath, live]);
    const apply = slotApplication.applyArraySlots;
    const application = vi
      .spyOn(slotApplication, 'applyArraySlots')
      .mockImplementation((host, plan, context) => {
        const result = apply(host, plan, context);
        if (mode === 'retained') {
          if (!metadata)
            throw new Error('Expected the retained root classification');
          const order = [
            metadata.order[0],
            destination,
            ...metadata.order.slice(2),
          ];
          expect(root.runtime.latentRaw.get(movedOwn)).toBe(stored);
          expect(root.runtime.latentRaw.get(movedLive)).toBe(liveValue);
          expect(root.runtime.latentRawMetadata?.get(movedOwn)).toEqual({
            ...metadata,
            path: movedPath,
            order,
          });
          expect(root.runtime.latentRawMetadata?.get(movedLive)).toEqual({
            path: movedPath,
            blueprintNode: original.blueprintNode,
            order,
          });
        }
        return result;
      });
    const inserted = live === 'string' ? 'new' : 99;
    if (operation === 'insert') dispatchInsert(list, 0, inserted);
    else dispatchRemove(list, 0);
    expect(application).toHaveBeenCalledOnce();
    application.mockRestore();
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
    if (mode === 'single') expect(root.runtime.latentRaw.size).toBe(0);
    if (mode !== 'retained') return;
    if (!metadata) throw new Error('Expected the retained root classification');
    const movedOrder = [
      metadata.order[0],
      destination,
      ...metadata.order.slice(2),
    ];
    expect(root.runtime.latentRaw.has(movedOwn)).toBe(false);
    expect(root.runtime.latentRawMetadata?.has(movedOwn)).toBe(false);
    expect(root.runtime.latentRaw.get(movedLive)).toBe(liveValue);
    expect(root.runtime.latentRawMetadata?.get(movedLive)).toEqual({
      path: movedPath,
      blueprintNode: original.blueprintNode,
      order: movedOrder,
    });
    if (operation === 'insert') dispatchRemove(list, 0);
    else dispatchInsert(list, 0, stored);
    const restored = getDispatchNode(list, String(sourceIndex));
    expect(restored.raw).toBe(liveValue);
    expect(root.runtime.latentRaw.get(sourceKey)).toBe(stored);
    expect(root.runtime.latentRawMetadata?.get(sourceKey)).toMatchObject({
      path: `/list/${sourceIndex}`,
      order: metadata.order,
    });
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'b'), true);
    expect(getDispatchNode(list, String(sourceIndex)).raw).toBe(stored);
    expect(
      root.runtime.latentRaw.get(
        JSON.stringify([`/list/${sourceIndex}`, live]),
      ),
    ).toBe(liveValue);
    expect(
      root.runtime.latentRawMetadata?.get(
        JSON.stringify([`/list/${sourceIndex}`, live]),
      ),
    ).toMatchObject({ path: `/list/${sourceIndex}`, order: metadata.order });
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
    expect(root.runtime.latentRaw.get(sourceKey)).toBe(stored);
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
