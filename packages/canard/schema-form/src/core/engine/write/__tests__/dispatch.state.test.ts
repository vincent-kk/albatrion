import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import {
  FieldNodeState,
  ValidationMode,
} from '@/schema-form/core/engine/types/state';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchClearSubtreeState } from '../utils/entry/dispatchClearSubtreeState';
import { dispatchResetSubtree } from '../utils/entry/dispatchResetSubtree';
import { dispatchSetState } from '../utils/entry/dispatchSetState';
import { dispatchSetSubtreeState } from '../utils/entry/dispatchSetSubtreeState';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-observers
describe('dispatcher state events', () => {
  it.each(['node', 'subtree', 'clear'] as const)(
    'keeps immediate %s state writes during reset out of the settlement delta',
    (kind) => {
      // The one-shot callback mutates its captured tree during shipping execution.
      pinSlotShipping();
      let duringReset: (() => void) | undefined;
      const { root, runtime } = createDispatchTree(
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              controls: {
                injectTo: () => {
                  const callback = duringReset;
                  duringReset = undefined;
                  callback?.();
                  return {};
                },
              },
            },
          },
        },
        { source: 'a' },
      );
      dispatchSetValue(root, { source: 'a' });
      const before = readFieldNodeRevision(
        root,
        FieldNodeEventType.UpdateState,
      );
      duringReset = () => {
        if (kind === 'subtree') dispatchSetSubtreeState(root, { custom: true });
        else dispatchSetState(root, { custom: true });
        if (kind === 'clear') dispatchClearSubtreeState(root);
      };

      dispatchResetSubtree(root);

      expect(runtime.globalStateCounts.get('custom') ?? 0).toBe(
        kind === 'subtree' ? 2 : kind === 'clear' ? 0 : 1,
      );
      expect(
        readFieldNodeRevision(root, FieldNodeEventType.UpdateState) - before,
      ).toBe(1);
      dispatchClearSubtreeState(root);
      expect(runtime.globalStateCounts.has('custom')).toBe(false);
      expect(runtime.globalState).toEqual({});
    },
  );

  it('EVENT-012 EVENT-067 43C-01 delivers state and aggregate bits synchronously', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const onChange = vi.fn();
    const onStateChange = vi.fn();
    runtime.onChange = onChange;
    runtime.onStateChange = onStateChange;
    runtime.validationMode = ValidationMode.OnChange;
    const before = runtime.commitNumber;
    const validationStamp = runtime.validationStamp;
    const seen: number[] = [];
    subscribeFieldNode(root, (event) => seen.push(event.type));

    dispatchSetState(root, { [FieldNodeState.Dirty]: true });

    expect(root.interactionState[FieldNodeState.Dirty]).toBe(true);
    expect(root.raw).toBeUndefined();
    expect(root.emit).toBeUndefined();
    expect(runtime.commitNumber).toBe(before);
    expect(seen).toEqual([
      FieldNodeEventType.UpdateState | FieldNodeEventType.UpdateGlobalState,
    ]);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateState)).toBe(1);
    expect(
      readFieldNodeRevision(root, FieldNodeEventType.UpdateGlobalState),
    ).toBe(1);
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(runtime.validationStamp).toBe(validationStamp);
  });

  it('EVENT-045 EVENT-067 31C-01 flushes one state event after the settle wave', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        child: { type: 'string' },
      },
    });
    dispatchSetValue(root, { child: 'old' });
    const child = getDispatchChild(root, 'child');
    const seen: string[] = [];
    const onStateChange = vi.fn();
    runtime.onStateChange = onStateChange;
    subscribeFieldNode(root, (event) => {
      if (event.type & FieldNodeEventType.UpdateValue) seen.push('settle');
    });
    subscribeFieldNode(child, (event) => {
      if (event.type & FieldNodeEventType.UpdateState) seen.push('state');
    });

    dispatchBatch(root, () => {
      dispatchSetState(child, { [FieldNodeState.Dirty]: true });
      dispatchSetState(child, { [FieldNodeState.Touched]: true });
      dispatchSetValue(root, { child: 'new' });
      expect(seen).toEqual([]);
    });

    expect(seen).toEqual(['settle', 'state']);
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(readFieldNodeRevision(child, FieldNodeEventType.UpdateState)).toBe(
      1,
    );
  });

  it('SURFACE-053 patches and clears only a live subtree', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        first: { type: 'string' },
        second: { type: 'string' },
      },
    });
    dispatchSetValue(root, { first: 'a', second: 'b' });
    const first = getDispatchChild(root, 'first');
    const second = getDispatchChild(root, 'second');

    dispatchSetSubtreeState(first, { [FieldNodeState.Dirty]: true });
    expect(first.interactionState[FieldNodeState.Dirty]).toBe(true);
    expect(second.interactionState[FieldNodeState.Dirty]).toBeUndefined();
    dispatchClearSubtreeState(first);
    expect(first.interactionState[FieldNodeState.Dirty]).toBeUndefined();
  });

  it('NODE-044 ignores state writes on a detached occurrence', () => {
    const { root } = createDispatchTree({ type: 'string' });
    root.detached = true;
    const before = root.interactionState;
    dispatchSetState(root, { [FieldNodeState.Dirty]: true });
    dispatchSetSubtreeState(root, { [FieldNodeState.Touched]: true });
    dispatchClearSubtreeState(root);
    expect(root.interactionState).toBe(before);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateState)).toBe(0);
  });

  it('NODE-044 treats a detached target as a no-op during report delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    root.detached = true;
    runtime.reportingErrors = true;
    expect(() =>
      dispatchSetState(root, { [FieldNodeState.Dirty]: true }),
    ).not.toThrow();
    expect(() => dispatchClearSubtreeState(root)).not.toThrow();
    expect(root.interactionState[FieldNodeState.Dirty]).toBeUndefined();
  });

  it('ERROR-029 refuses state writes while the error observer is active', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.reportingErrors = true;
    expect(() =>
      dispatchSetState(root, { [FieldNodeState.Dirty]: true }),
    ).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }),
    );
    expect(root.interactionState[FieldNodeState.Dirty]).toBeUndefined();
  });

  it('EVENT-067 surfaces an onStateChange failure after state delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const failure = new Error('state observer');
    const seen = vi.fn();
    subscribeFieldNode(root, seen);
    runtime.onStateChange = () => {
      throw failure;
    };
    expect(() =>
      dispatchSetState(root, { [FieldNodeState.Dirty]: true }),
    ).toThrow(failure);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('EVENT-067 lets an onStateChange write start its own synchronous delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: boolean[] = [];
    let callbacks = 0;
    subscribeFieldNode(root, (event) => {
      if (event.type & FieldNodeEventType.UpdateState)
        seen.push(root.interactionState[FieldNodeState.Touched] === true);
    });
    runtime.onStateChange = () => {
      callbacks += 1;
      if (callbacks === 1)
        dispatchSetState(root, { [FieldNodeState.Touched]: true });
    };
    dispatchBatch(root, () =>
      dispatchSetState(root, { [FieldNodeState.Dirty]: true }),
    );
    expect(seen).toEqual([false, true]);
    expect(callbacks).toBe(2);
    expect(runtime.entryDepth).toBe(0);
  });

  it('EVENT-067 flushes a direct onStateChange write after its first callback', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: boolean[] = [];
    let callbacks = 0;
    subscribeFieldNode(root, (event) => {
      if (event.type & FieldNodeEventType.UpdateState)
        seen.push(root.interactionState[FieldNodeState.Touched] === true);
    });
    runtime.onStateChange = () => {
      callbacks += 1;
      if (callbacks === 1)
        dispatchSetState(root, { [FieldNodeState.Touched]: true });
    };
    dispatchSetState(root, { [FieldNodeState.Dirty]: true });
    expect(seen).toEqual([false, true]);
    expect(callbacks).toBe(2);
  });
});
