import { expect, it } from 'vitest';

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

it.each([
  { operation: 'insert', depth: 1 },
  { operation: 'insert', depth: 2 },
  { operation: 'remove', depth: 1 },
  { operation: 'remove', depth: 2 },
] satisfies readonly { operation: 'insert' | 'remove'; depth: 1 | 2 }[])(
  'V3 $operation at depth $depth retains the previously live candidate on switch-back',
  async ({ operation, depth }) => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const inputs: unknown[] = [];
    const validator: Validator = {
      compile: () => (value) => {
        inputs.push(value);
        return null;
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      descendantSchema(operation, depth),
      undefined,
      validator,
    );
    const value = depth === 1 ? { v: 'live' } : { box: { v: 'live' } };
    dispatchMount(root, {
      kind: 'string',
      list: operation === 'insert' ? [value] : [{}, value],
    });
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    const list = getDispatchNode(root, 'list');
    const source = operation === 'insert' ? 0 : 1;
    const destination = operation === 'insert' ? 1 : 0;
    const names = depth === 1 ? ['v'] : ['box', 'v'];
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    expect(getDispatchNode(list, String(source), ...names).raw).toBe(37);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    const original = getDispatchNode(list, String(source), ...names);
    expect(original.raw).toBe('live');
    root.runtime.disableAutomaticWrites = true;
    const path = `/list/${destination}/` + names.join('/');
    const stringKey = JSON.stringify([path, 'string']);
    if (operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    expect(getDispatchNode(list, String(destination), ...names).raw).toBe(37);
    expect(root.runtime.latentRaw.get(stringKey)).toBe('live');
    expect(root.runtime.latentRawMetadata?.get(stringKey)).toMatchObject({
      path,
      blueprintNode: original.blueprintNode,
    });
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    expect(getDispatchNode(list, String(destination), ...names).raw).toBe(
      'live',
    );
    const expected = {
      kind: 'number',
      list: operation === 'insert' ? [{}, value] : [value],
    };
    expect(root.local).toEqual(expected);
    expect(root.emit).toEqual(expected);
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({
      current: { local: expected, emit: expected },
    });
    await dispatchValidate(root);
    expect(inputs.at(-1)).toEqual(expected);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    expect(getDispatchNode(list, String(destination), ...names).raw).toBe(37);
  },
);

/**
 * Bind normal and reversed candidate gates at neighboring tuple positions.
 * @param operation - Direction in which the normal source moves
 * @param depth - Property levels between the item and the candidate
 * @returns Schema whose destination selects the other stored kind
 */
const descendantSchema = (
  operation: 'insert' | 'remove',
  depth: 1 | 2,
): BlueprintSchema => {
  const path = depth === 1 ? '../../kind' : '../../../kind';
  const items = [false, true].map((reversed): BlueprintSchema => {
    const object: BlueprintSchema = {
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
      ? object
      : { type: 'object', properties: { box: object } };
  });
  return {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      list: {
        type: 'array',
        prefixItems: operation === 'insert' ? items : items.slice().reverse(),
      },
    },
  };
};
