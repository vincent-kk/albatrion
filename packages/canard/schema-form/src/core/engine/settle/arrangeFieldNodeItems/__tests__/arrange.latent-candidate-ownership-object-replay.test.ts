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
  dispatchValidate,
  subscribeFieldNode,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';

/** Composed fallback when a recreated object root may also have its own source. */
interface ReplayCase {
  /** Regression or unchanged behavior comparison. */
  tag: 'R1' | '[control] R1';
  /** Operation moving the source onto the other tuple template. */
  operation: 'insert' | 'remove';
  /** Whether the destination declares v as a number or receives it as an extra. */
  destination: 'declared' | 'extra';
  /** Whether the source root retains its own HostLatent through an extra key. */
  extras: boolean;
}

it.each<ReplayCase>([
  { tag: 'R1', operation: 'insert', destination: 'declared', extras: true },
  { tag: 'R1', operation: 'remove', destination: 'declared', extras: true },
  { tag: 'R1', operation: 'insert', destination: 'extra', extras: true },
  { tag: 'R1', operation: 'remove', destination: 'extra', extras: true },
  {
    tag: '[control] R1',
    operation: 'insert',
    destination: 'declared',
    extras: false,
  },
  {
    tag: '[control] R1',
    operation: 'remove',
    destination: 'declared',
    extras: false,
  },
  {
    tag: '[control] R1',
    operation: 'insert',
    destination: 'extra',
    extras: false,
  },
  {
    tag: '[control] R1',
    operation: 'remove',
    destination: 'extra',
    extras: false,
  },
])(
  '$tag $operation keeps $destination values with root extras=$extras',
  async ({ operation, destination, extras }) => {
    const source: BlueprintSchema = {
      type: 'object',
      properties: {
        v: { type: destination === 'declared' ? 'string' : 'number' },
      },
      allOf: [
        {
          controls: { active: false },
          properties: { unused: { type: 'string' } },
        },
        {
          controls: { active: false },
          properties: { unused: { type: 'number' } },
        },
      ],
    };
    const target: BlueprintSchema = {
      type: 'object',
      properties: destination === 'declared' ? { v: { type: 'number' } } : {},
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
        type: 'array',
        prefixItems:
          operation === 'insert' ? [source, target] : [target, source],
      },
      undefined,
      validator,
    );
    const input = {
      v: destination === 'declared' ? '123' : 123,
      ...(extras ? { extra: 9 } : {}),
    };
    dispatchMount(root, operation === 'insert' ? [input] : [{}, input]);
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    if (operation === 'insert') dispatchInsert(root, 0, { v: '5' });
    else dispatchRemove(root, 0);
    const moved = getDispatchNode(root, operation === 'insert' ? '1' : '0');
    const expectedMoved = { v: 123, ...(extras ? { extra: 9 } : {}) };
    const inserted = { v: destination === 'declared' ? '5' : 5 };
    const expected =
      operation === 'insert' ? [inserted, expectedMoved] : [expectedMoved];
    expect(moved.local).toEqual(expectedMoved);
    expect(moved.emit).toEqual(expectedMoved);
    if (destination === 'declared') {
      expect(getDispatchNode(moved, 'v').raw).toBe(123);
      expect(moved.undeclaredValues).toEqual(extras ? { extra: 9 } : undefined);
    } else {
      expect(moved.structure?.v).toBeUndefined();
      expect(moved.undeclaredValues).toEqual(expectedMoved);
    }
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
