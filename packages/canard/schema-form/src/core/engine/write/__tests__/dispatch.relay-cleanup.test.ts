import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchRelayInput } from '../utils/entry/dispatchRelayInput';
import { dispatchResetSubtree } from '../utils/entry/dispatchResetSubtree';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract input-relay-cleanup
describe('relay cleanup across immediate commits and failed flushes', () => {
  it('consumes at an immediate reset before the same batch marks its later write', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'base');
    dispatchSetValue(root, 'edited');
    let afterReset = 0;
    dispatchRelayInput(root, 'x', WriteOption.Overwrite, (value) => {
      dispatchResetSubtree(root);
      afterReset = readFieldNodeRevision(
        root,
        FieldNodeEventType.RequestRefresh,
      );
      dispatchSetValue(root, value);
    });
    expect(root.local).toBe('x');
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestRefresh)).toBe(
      afterReset + 1,
    );
    expect(runtime.inputRelays).toBeUndefined();
  });

  it('clears an outer flush rejected before commit after the caller mutates a marked virtual tuple', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      options: { virtual: { pair: { fields: ['a', 'b'] } } },
    });
    dispatchMount(root, { a: 'old', b: 'old' });
    const pair = getDispatchChild(root, 'pair');
    const emitted = ['x', 'y'];
    const before = runtime.commitNumber;
    expect(() =>
      dispatchBatch(root, () => {
        dispatchRelayInput(pair, emitted, WriteOption.Overwrite, (value) =>
          dispatchSetValue(pair, value),
        );
        emitted.pop();
      }),
    ).toThrow('Invalid virtual node values at /pair');
    expect(runtime.commitNumber).toBe(before);
    expect(runtime.inputRelays).toBeUndefined();
    expect(root.local).toEqual({ a: 'old', b: 'old' });
    const child = getDispatchChild(root, 'a');
    const refresh = readFieldNodeRevision(
      child,
      FieldNodeEventType.RequestRefresh,
    );
    dispatchSetValue(pair, ['x', 'y']);
    expect(
      readFieldNodeRevision(child, FieldNodeEventType.RequestRefresh),
    ).toBe(refresh + 1);
  });
});
