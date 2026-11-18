import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType as E } from '../../record';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchPop } from '../utils/entry/dispatchPop';
import { dispatchPush } from '../utils/entry/dispatchPush';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';

it.each([false, true])(
  'keeps one pending value payload per node with an existing observer: %s',
  (observed) => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchMount(root, [0]);
    const initial = root.storedValue;
    const delivered: unknown[] = [];
    if (observed)
      subscribeFieldNode(root, (event) =>
        delivered.push(event.payload?.[E.UpdateValue]),
      );
    const payloads: unknown[] = [];
    dispatchBatch(root, () => {
      dispatchPush(root, 1);
      payloads.push(root.pendingDelivery?.payload?.[E.UpdateValue]);
      dispatchPush(root, 2);
      payloads.push(root.pendingDelivery?.payload?.[E.UpdateValue]);
      dispatchPop(root);
      payloads.push(root.pendingDelivery?.payload?.[E.UpdateValue]);
    });
    expect(new Set(payloads).size).toBe(1);
    expect(payloads[0]).toEqual({
      previous: { value: initial, outputValue: initial },
      current: { value: root.storedValue, outputValue: root.storedOutputValue },
    });
    expect(Object.isFrozen(payloads[0])).toBe(true);
    if (observed) expect(delivered).toEqual([payloads[0]]);
    dispatchPush(root, 3);
    expect(payloads[0]).toEqual({
      previous: { value: initial, outputValue: initial },
      current: { value: [0, 1], outputValue: [0, 1] },
    });
  },
);
