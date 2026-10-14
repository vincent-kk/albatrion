import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import {
  FieldNodeEventType,
  FieldNodeRequestType,
} from '@/schema-form/core/engine/record';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';

import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchClearExternalErrors } from '../utils/entry/dispatchClearExternalErrors';
import { dispatchClearSubtreeState } from '../utils/entry/dispatchClearSubtreeState';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchRequest } from '../utils/entry/dispatchRequest';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetState } from '../utils/entry/dispatchSetState';
import { dispatchSetSubtreeState } from '../utils/entry/dispatchSetSubtreeState';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-budget
describe('dispatcher budgets', () => {
  it('EVENT-008 EVENT-021 ERROR-070 throw after the final committed feedback wave', () => {
    const { root, runtime } = createDispatchTree({ type: 'number' });
    let deliveries = 0;
    subscribeFieldNode(root, () => {
      deliveries += 1;
      if (deliveries <= 26) dispatchSetValue(root, deliveries);
    });
    expect(() => dispatchSetValue(root, 0)).toThrow();
    expect(root.emit).toBeGreaterThanOrEqual(25);
    expect(runtime.diagnostics.status).toBe('stable');
  });

  it('EVENT-008 delivers the last committed value to unaffected listeners', () => {
    const { root } = createDispatchTree({ type: 'number' });
    let feedbackCalls = 0;
    const observed: unknown[] = [];
    subscribeFieldNode(root, () => {
      feedbackCalls += 1;
      dispatchSetValue(root, feedbackCalls);
    });
    subscribeFieldNode(root, () => observed.push(root.emit));
    expect(() => dispatchSetValue(root, 0)).toThrow();
    expect(observed.at(-1)).toBe(root.emit);
    expect(observed.length).toBe(feedbackCalls);
  });

  it('EVENT-008 refuses the 26th feedback write without notifying and accepts the next caller write', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const observed: unknown[] = [];
    let feedbackCalls = 0;
    let feedbackEnabled = true;
    subscribeFieldNode(root, () => {
      observed.push(root.emit);
      if (feedbackEnabled && feedbackCalls < 26)
        dispatchSetValue(root, `p${feedbackCalls++}`);
    });

    expect(() => dispatchSetValue(root, 'go')).toThrow();
    expect(feedbackCalls).toBe(26);
    expect(root.emit).toBe('p24');
    expect(observed).toHaveLength(26);
    expect(observed.at(-1)).toBe('p24');
    expect(runtime.entryDepth).toBe(0);

    feedbackEnabled = false;
    dispatchSetValue(root, 'caller');
    expect(root.emit).toBe('caller');
    expect(observed).toHaveLength(27);
    expect(runtime.entryDepth).toBe(0);
  });

  it('EVENT-008 refuses a listener batch as a whole at the feedback limit', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    let feedbackCalls = 0;
    let batchRan = false;
    const observed: unknown[] = [];
    subscribeFieldNode(root, () => {
      observed.push(root.emit);
      if (feedbackCalls < 25) dispatchSetValue(root, `p${feedbackCalls++}`);
      else
        dispatchBatch(root, () => {
          batchRan = true;
          dispatchSetValue(root, 'blocked');
        });
    });

    expect(() => dispatchSetValue(root, 'go')).toThrow();
    expect(batchRan).toBe(false);
    expect(root.emit).toBe('p24');
    expect(observed).toHaveLength(26);
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.batchDepth ?? 0).toBe(0);
  });

  it('EVENT-008 refuses state, external error, and request writes at the feedback limit', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const issues = [{ dataPath: '', message: 'kept' }];
    dispatchSetState(root, { [FieldNodeState.Touched]: true });
    dispatchSetExternalErrors(root, issues);
    const observed: number[] = [];
    let feedbackCalls = 0;
    subscribeFieldNode(root, (event) => {
      observed.push(event.type);
      if (!(event.type & FieldNodeEventType.UpdateValue)) return;
      if (feedbackCalls < 25) {
        dispatchSetValue(root, `p${feedbackCalls++}`);
        return;
      }
      dispatchSetState(root, { [FieldNodeState.Dirty]: true });
      dispatchSetSubtreeState(root, { [FieldNodeState.Dirty]: true });
      dispatchClearSubtreeState(root);
      dispatchSetExternalErrors(root, [{ dataPath: '', message: 'blocked' }]);
      dispatchClearExternalErrors(root);
      dispatchRequest(root, FieldNodeRequestType.Focus);
    });

    expect(() => dispatchSetValue(root, 'go')).toThrow();
    expect(root.interactionState[FieldNodeState.Touched]).toBe(true);
    expect(root.interactionState[FieldNodeState.Dirty]).toBeUndefined();
    expect(runtime.nodeErrors?.get(root)).toBe(issues);
    expect(observed).toHaveLength(26);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateState)).toBe(1);
    expect(readFieldNodeRevision(root, FieldNodeEventType.UpdateError)).toBe(1);
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestFocus)).toBe(
      0,
    );
    expect(runtime.entryDepth).toBe(0);
  });

  it('EVENT-034 limits onChange nesting while retaining the last commit', () => {
    const { root, runtime } = createDispatchTree({ type: 'number' });
    let changes = 0;
    runtime.onChange = () => {
      changes += 1;
      dispatchSetValue(root, changes);
    };
    expect(() => dispatchSetValue(root, 0)).toThrow();
    expect(changes).toBe(25);
    expect(root.emit).toBe(25);
  });

  it('CONTROLS-079 treats a user callback write as nested feedback', () => {
    let root: DispatchTestNode | undefined;
    const { root: created, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        source: {
          type: 'string',
          controls: {
            injectTo: () => {
              if (root)
                dispatchSetValue(getDispatchChild(root, 'target'), 'callback');
              return {};
            },
          },
        },
        target: { type: 'string' },
      },
    });
    root = created;
    dispatchMount(root, { source: 'start', target: 'old' });
    dispatchSetValue(getDispatchChild(root, 'source'), 'next');
    expect(getDispatchChild(root, 'target').emit).toBe('callback');
    expect(runtime.entryDepth).toBe(0);
  });
});
