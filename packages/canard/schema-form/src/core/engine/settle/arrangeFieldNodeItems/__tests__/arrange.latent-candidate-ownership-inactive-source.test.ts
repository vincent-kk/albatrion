import { expect, it } from 'vitest';

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

/** Surviving inactive source and destination with one declared number kind. */
interface MoveCase {
  /** Structural operation that recreates the source at the other tuple position. */
  operation: 'insert' | 'remove';
  /** Whether an array separates the slot root from its candidate value. */
  depth: 'property' | 'array';
}

it.each<MoveCase>([
  { operation: 'insert', depth: 'property' },
  { operation: 'remove', depth: 'property' },
  { operation: 'insert', depth: 'array' },
  { operation: 'remove', depth: 'array' },
])(
  'C1 inactive source $operation restores its number through $depth',
  async ({ operation, depth }) => {
    const validationInputs: unknown[] = [];
    const validator: Validator = {
      compile: () => (value) => {
        validationInputs.push(value);
        return null;
      },
      compileGuard: () => () => true,
    };
    const source = sourceSlot(depth);
    const destination: BlueprintSchema = {
      type: 'object',
      properties:
        depth === 'property'
          ? { v: { type: 'number' } }
          : { values: { type: 'array', items: { type: 'number' } } },
    };
    const { root, runtime } = createDispatchTree(
      {
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          kind: { type: 'string' },
          list: {
            type: 'array',
            prefixItems:
              operation === 'insert'
                ? [source, destination]
                : [destination, source],
          },
        },
      },
      undefined,
      validator,
    );
    const liveValue =
      depth === 'property' ? { v: 'live' } : { values: ['live'] };
    dispatchMount(root, {
      show: true,
      kind: 'string',
      list: operation === 'insert' ? [liveValue] : [{}, liveValue],
    });
    const from = operation === 'insert' ? 0 : 1;
    const to = operation === 'insert' ? 1 : 0;
    const names = depth === 'property' ? ['v'] : ['values', '0'];
    const sourcePath = `/list/${from}/${names.join('/')}`;
    const path = `/list/${to}/${names.join('/')}`;
    const list = getDispatchNode(root, 'list');
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    expect(getDispatchNode(list, String(from), ...names).raw).toBe(37);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    expect(getDispatchNode(list, String(from), ...names).raw).toBe('live');
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    expect(list.structure?.[String(from)]).toBeUndefined();
    const numberKey = JSON.stringify([sourcePath, 'number']);
    const stringKey = JSON.stringify([sourcePath, 'string']);
    expect(runtime.latentRaw.get(numberKey)).toBe(37);
    expect(runtime.latentRaw.get(stringKey)).toBe('live');
    const stringMetadata = runtime.latentRawMetadata?.get(stringKey);
    if (!stringMetadata)
      throw new Error('Expected the inactive string source classification');
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    if (operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    const expectedValue = depth === 'property' ? { v: 37 } : { values: [37] };
    const expected = {
      show: false,
      kind: 'string',
      list: operation === 'insert' ? [{}, expectedValue] : [expectedValue],
    };
    const moved = getDispatchNode(list, String(to), ...names);
    expect(moved.blueprintNode.kind).toBe('number');
    expect(moved.raw).toBe(37);
    expect(root.local).toEqual(expected);
    expect(root.emit).toEqual(expected);
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({ current: { local: expected, emit: expected } });
    await dispatchValidate(root);
    expect(validationInputs.at(-1)).toEqual(expected);
    expect([...runtime.misfitPaths]).toEqual([]);
    const movedString = JSON.stringify([path, 'string']);
    expect(runtime.latentRaw.get(movedString)).toBe('live');
    expect(runtime.latentRawMetadata?.get(movedString)).toEqual({
      ...stringMetadata,
      path,
      order: [stringMetadata.order[0], to, ...stringMetadata.order.slice(2)],
    });
    expect(runtime.latentRaw.has(numberKey)).toBe(false);
    expect(runtime.latentRaw.has(stringKey)).toBe(false);
  },
);

/** Build a gated single root with two retained value kinds at the selected depth. */
function sourceSlot(depth: MoveCase['depth']): BlueprintSchema {
  return depth === 'property'
    ? {
        type: 'object',
        controls: { active: '../../show' },
        allOf: [
          {
            controls: { active: '../../kind === "string"' },
            properties: { v: { type: 'string' } },
          },
          {
            controls: { active: '../../kind === "number"' },
            properties: { v: { type: 'number', default: 37 } },
          },
        ],
      }
    : {
        type: 'object',
        controls: { active: '../../show' },
        properties: {
          values: {
            type: 'array',
            allOf: [
              {
                controls: { active: '../../../kind === "string"' },
                items: { type: 'string' },
              },
              {
                controls: { active: '../../../kind === "number"' },
                items: { type: 'number', default: 37 },
              },
            ],
          },
        },
      };
}
