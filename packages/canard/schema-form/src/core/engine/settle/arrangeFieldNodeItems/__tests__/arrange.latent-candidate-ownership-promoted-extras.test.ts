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

/** Source availability and structural verb for an extra becoming a declared child. */
interface MoveCase {
  /** Operation that recreates the source under the destination template. */
  operation: 'insert' | 'remove';
  /** Whether the source has already exited before it moves. */
  inactive: boolean;
}

it.each<MoveCase>([
  { operation: 'insert', inactive: false },
  { operation: 'remove', inactive: false },
  { operation: 'insert', inactive: true },
  { operation: 'remove', inactive: true },
])(
  'R1 $operation promotes a moved extra into a declared child with inactive=$inactive',
  async ({ operation, inactive }) => {
    const source: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show' },
      allOf: [
        {
          controls: { active: true },
          properties: { v: { type: 'string' } },
        },
        {
          controls: { active: false },
          properties: { v: { type: 'number' } },
        },
      ],
    };
    const destination: BlueprintSchema = {
      type: 'object',
      properties: { b: { type: 'number' }, v: { type: 'string' } },
    };
    const validationInputs: unknown[] = [];
    const validator: Validator = {
      compile: () => (value) => {
        validationInputs.push(value);
        return null;
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      {
        type: 'object',
        properties: {
          show: { type: 'boolean' },
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
    const value = { v: 'live', b: 99, keep: 'extra' };
    dispatchMount(root, {
      show: true,
      list: operation === 'insert' ? [value] : [{}, value],
    });
    if (inactive) dispatchSetValue(getDispatchNode(root, 'show'), false);
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    const list = getDispatchNode(root, 'list');
    if (operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    const moved = getDispatchNode(list, operation === 'insert' ? '1' : '0');
    const expected = {
      show: !inactive,
      list: operation === 'insert' ? [{}, value] : [value],
    };
    expect(getDispatchNode(moved, 'b').raw).toBe(99);
    expect(getDispatchNode(moved, 'v').raw).toBe('live');
    expect(moved.undeclaredValues).toEqual({ keep: 'extra' });
    expect(root.local).toEqual(expected);
    expect(root.emit).toEqual(expected);
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({ current: { local: expected, emit: expected } });
    await dispatchValidate(root);
    expect(validationInputs.at(-1)).toEqual(expected);
    expect([...root.runtime.misfitPaths]).toEqual([]);
  },
);
