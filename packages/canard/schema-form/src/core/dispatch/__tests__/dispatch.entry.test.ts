import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '../../record';
import { SetValueOption } from '../../types/value';
import {
  adoptFieldNodeChain,
  dispatchContextChange,
  dispatchMount,
  dispatchResetForm,
  dispatchResetSubtree,
  dispatchSetValue,
  readFieldNodeRevision,
  subscribeFieldNode,
} from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-entry
describe('dispatcher entry chain', () => {
  it('EVENT-027 and EVENT-004 deliver a committed write before returning', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    subscribeFieldNode(root, (event) => seen.push(event.type));
    dispatchSetValue(root, 'value');
    expect(root.emit).toBe('value');
    expect(seen.some((type) => !!(type & FieldNodeEventType.UpdateValue))).toBe(
      true,
    );
    expect(runtime.entryDepth).toBe(0);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateValue)).toBe(1);
  });

  it('EVENT-030 adopts an open chain and its pending records', () => {
    const previous = createDispatchTree({ type: 'string' });
    const next = createDispatchTree({ type: 'string' });
    previous.runtime.entryDepth = 2;
    previous.runtime.feedbackBudget = 7;
    previous.runtime.onChangeBudget = 3;
    previous.runtime.batchDepth = 1;
    previous.runtime.batchWrites = [
      {
        node: previous.root,
        value: 'pending',
        option: SetValueOption.Overwrite,
      },
    ];
    const failure = new Error('pending failure');
    previous.runtime.chainErrors = [failure];
    adoptFieldNodeChain(previous.root, next.root);
    expect(next.runtime.entryDepth).toBe(2);
    expect(next.runtime.feedbackBudget).toBe(7);
    expect(next.runtime.onChangeBudget).toBe(3);
    expect(next.runtime.batchDepth).toBe(1);
    expect(next.runtime.batchWrites).toEqual([
      {
        node: previous.root,
        value: 'pending',
        option: SetValueOption.Overwrite,
      },
    ]);
    expect(next.runtime.chainErrors).toEqual([failure]);
    expect(previous.runtime.entryDepth).toBe(0);
    expect(previous.runtime.adoptedRoot).toBe(next.root);
  });

  it('EVENT-027 context, mount and both resets use the entry boundary', () => {
    const { root, runtime } = createDispatchTree(
      {
        type: 'object',
        properties: {
          child: { type: 'string' },
        },
      },
      { child: 'initial' },
    );
    dispatchMount(root, { child: 'initial' });
    dispatchContextChange(root, { label: 'next' });
    expect(runtime.context).toEqual({ label: 'next' });
    dispatchSetValue(getDispatchChild(root, 'child'), 'changed');
    dispatchResetSubtree(getDispatchChild(root, 'child'));
    expect(getDispatchChild(root, 'child').emit).toBe('initial');
    dispatchResetForm(root, { child: 'new' });
    expect(getDispatchChild(root, 'child').emit).toBe('new');
  });
});
