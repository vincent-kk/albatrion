import { describe, expect, it } from 'vitest';

import { SchemaNodeEventType, SchemaNodeRequestType } from '../../record';
import { NodeState } from '../../types/state';
import { dispatchBatch, dispatchClearExternalErrors, dispatchClearSubtreeState,
  dispatchMount, dispatchRequest, dispatchSetExternalErrors, dispatchSetState,
  dispatchSetSubtreeState, dispatchSetValue, readSchemaNodeRevision,
  subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import type { DispatchTestNode } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-budget
describe('dispatcher budgets', () => {
  it('EVENT-008 EVENT-021 ERROR-070 throw after the final committed feedback wave', () => {
    const { root, runtime } = createDispatchTree({ type: 'number' });
    let deliveries = 0;
    subscribeSchemaNode(root, () => {
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
    subscribeSchemaNode(root, () => {
      feedbackCalls += 1;
      dispatchSetValue(root, feedbackCalls);
    });
    subscribeSchemaNode(root, () => observed.push(root.emit));
    expect(() => dispatchSetValue(root, 0)).toThrow();
    expect(observed.at(-1)).toBe(root.emit);
    expect(observed.length).toBe(feedbackCalls);
  });

  it('EVENT-008 refuses the 26th feedback write without notifying and accepts the next caller write', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const observed: unknown[] = [];
    let feedbackCalls = 0;
    let feedbackEnabled = true;
    subscribeSchemaNode(root, () => {
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
    subscribeSchemaNode(root, () => {
      observed.push(root.emit);
      if (feedbackCalls < 25) dispatchSetValue(root, `p${feedbackCalls++}`);
      else dispatchBatch(root, () => {
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
    dispatchSetState(root, { [NodeState.Touched]: true });
    dispatchSetExternalErrors(root, issues);
    const observed: number[] = [];
    let feedbackCalls = 0;
    subscribeSchemaNode(root, (event) => {
      observed.push(event.type);
      if (!(event.type & SchemaNodeEventType.UpdateValue)) return;
      if (feedbackCalls < 25) {
        dispatchSetValue(root, `p${feedbackCalls++}`);
        return;
      }
      dispatchSetState(root, { [NodeState.Dirty]: true });
      dispatchSetSubtreeState(root, { [NodeState.Dirty]: true });
      dispatchClearSubtreeState(root);
      dispatchSetExternalErrors(root, [{ dataPath: '', message: 'blocked' }]);
      dispatchClearExternalErrors(root);
      dispatchRequest(root, SchemaNodeRequestType.Focus);
    });

    expect(() => dispatchSetValue(root, 'go')).toThrow();
    expect(root.interactionState[NodeState.Touched]).toBe(true);
    expect(root.interactionState[NodeState.Dirty]).toBeUndefined();
    expect(runtime.nodeErrors?.get(root)).toBe(issues);
    expect(observed).toHaveLength(26);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateState)).toBe(1);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateError)).toBe(1);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.RequestFocus)).toBe(0);
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
    const { root: created, runtime } = createDispatchTree({ type: 'object', properties: {
      source: { type: 'string', controls: { injectTo: () => {
        if (root) dispatchSetValue(getDispatchChild(root, 'target'), 'callback');
        return {};
      } } },
      target: { type: 'string' },
    } });
    root = created;
    dispatchMount(root, { source: 'start', target: 'old' });
    dispatchSetValue(getDispatchChild(root, 'source'), 'next');
    expect(getDispatchChild(root, 'target').emit).toBe('callback');
    expect(runtime.entryDepth).toBe(0);
  });
});
