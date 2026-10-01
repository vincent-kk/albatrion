import { describe, expect, it } from 'vitest';

import { dispatchMount, dispatchSetValue, subscribeSchemaNode } from '../index';
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
    expect(observed.length).toBeGreaterThan(feedbackCalls);
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
