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

it.each(['insert', 'remove'] as const)(
  'W1 %s preserves candidates beneath an array with one immediate item template',
  (operation) => {
    const normal = nestedArray(false);
    const reversed = nestedArray(true);
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
        list: {
          type: 'array',
          prefixItems:
            operation === 'insert'
              ? [normal, reversed, reversed]
              : [reversed, normal, reversed],
        },
      },
    });
    const initial = {
      kind: 'string',
      list: operation === 'insert' ? [[{ v: 'live' }]] : [[], [{ v: 'live' }]],
    };
    dispatchMount(root, initial);
    const source = operation === 'insert' ? 0 : 1;
    const destination = operation === 'insert' ? 1 : 0;
    const sourcePath = `/list/${source}/0/v`;
    const path = `/list/${destination}/0/v`;
    const list = getDispatchNode(root, 'list');
    const old = getDispatchNode(list, String(source));
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    expect(getDispatchNode(old, '0', 'v').raw).toBe(37);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    const numberKey = JSON.stringify([sourcePath, 'number']);
    const numberMetadata = runtime.latentRawMetadata?.get(numberKey);
    expect(runtime.latentRaw.get(numberKey)).toBe(37);
    if (!numberMetadata)
      throw new Error('Expected the retained number classification');
    runtime.disableAutomaticWrites = true;
    if (operation === 'insert') dispatchInsert(list, 0, []);
    else dispatchRemove(list, 0);
    expect(old.detached).toBe(true);
    expect(getDispatchNode(list, String(destination), '0', 'v').raw).toBe(37);
    const restoredBlueprint = getDispatchNode(
      list,
      String(destination),
      '0',
      'v',
    ).blueprintNode;
    expect(list.local).toEqual(
      operation === 'insert' ? [[], [{ v: 37 }]] : [[{ v: 37 }]],
    );
    expect(root.emit).toEqual(root.local);
    const stringKey = JSON.stringify([path, 'string']);
    expect(runtime.latentRaw.get(stringKey)).toBe('live');
    expect(runtime.latentRawMetadata?.get(stringKey)).toMatchObject({ path });
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    expect(getDispatchNode(list, String(destination), '0', 'v').raw).toBe(
      'live',
    );
    const movedNumber = JSON.stringify([path, 'number']);
    expect(runtime.latentRaw.get(movedNumber)).toBe(37);
    expect(runtime.latentRawMetadata?.get(movedNumber)).toEqual({
      ...numberMetadata,
      blueprintNode: restoredBlueprint,
      path,
      order: [
        numberMetadata.order[0],
        destination,
        ...numberMetadata.order.slice(2),
      ],
    });
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    expect(getDispatchNode(list, String(destination), '0', 'v').raw).toBe(37);
    expect(runtime.latentRaw.get(stringKey)).toBe('live');
    expect(runtime.loadSnapshot).toEqual(
      operation === 'insert'
        ? { kind: 'string', list: [[], [{ v: 'live' }]] }
        : { kind: 'string', list: [[{ v: 'live' }]] },
    );
  },
);

/** Build an intermediate array whose only object item contains both candidate kinds. */
function nestedArray(reversed: boolean): BlueprintSchema {
  return {
    type: 'array',
    items: {
      type: 'object',
      allOf: [
        {
          controls: {
            active: `../../../kind === "${reversed ? 'number' : 'string'}"`,
          },
          properties: { v: { type: 'string' } },
        },
        {
          controls: {
            active: `../../../kind === "${reversed ? 'string' : 'number'}"`,
          },
          properties: { v: { type: 'number', default: 37 } },
        },
      ],
    },
  };
}
