import { describe, expect, it } from 'vitest';

import { SchemaNodeEventType } from '../../record';
import { dispatchBatch, dispatchSetValue, subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-waves
describe('dispatcher delivery waves', () => {
  it('SETTLE-007 and EVENT-004 visit root and children in document order', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      first: { type: 'string' }, second: { type: 'string' },
    } });
    dispatchSetValue(root, { first: 'a', second: 'b' });
    const seen: string[] = [];
    for (const node of [root, getDispatchChild(root, 'first'), getDispatchChild(root, 'second')])
      subscribeSchemaNode(node, () => seen.push(node.path));
    dispatchSetValue(root, { first: 'c', second: 'd' });
    expect(seen).toEqual(['', '/first', '/second']);
  });

  it('EVENT-008 sends a listener write in the next wave', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    subscribeSchemaNode(root, (event) => {
      if (!(event.type & SchemaNodeEventType.UpdateValue)) return;
      seen.push(String(root.emit));
      if (root.emit === 'first') dispatchSetValue(root, 'second');
    });
    dispatchSetValue(root, 'first');
    expect(seen).toEqual(['first', 'second']);
  });

  it('EVENT-011 fixes listeners at wave start and honors immediate unsubscription', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    let remove = () => {};
    subscribeSchemaNode(root, () => {
      seen.push('first');
      remove();
      subscribeSchemaNode(root, () => seen.push('late'));
    });
    remove = subscribeSchemaNode(root, () => seen.push('removed'));
    dispatchSetValue(root, 'a');
    expect(seen).toEqual(['first']);
  });

  it('EVENT-010 isolates listener errors until all deliveries finish', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('listener failure');
    const seen: string[] = [];
    subscribeSchemaNode(root, () => { throw failure; });
    subscribeSchemaNode(root, () => seen.push('delivered'));
    expect(() => dispatchSetValue(root, 'a')).toThrow(failure);
    expect(seen).toEqual(['delivered']);
  });

  it('EVENT-010 bundles two listener failures in occurrence order', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const first = new Error('first');
    const second = new Error('second');
    subscribeSchemaNode(root, () => { throw first; });
    subscribeSchemaNode(root, () => { throw second; });
    expect(() => dispatchSetValue(root, 'a')).toThrowError(expect.objectContaining({
      code: 'SCHEMA_FORM_ERROR.MULTIPLE_ERRORS', details: { errors: [first, second] },
    }));
  });

  it('EVENT-009 skips a detached node queued for delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    } });
    dispatchSetValue(root, { child: 'a' });
    const child = getDispatchChild(root, 'child');
    let calls = 0;
    subscribeSchemaNode(child, () => { calls += 1; });
    child.detached = true;
    runtime.deliveries?.set(child, { type: SchemaNodeEventType.UpdateValue });
    dispatchBatch(root, () => {});
    expect(calls).toBe(0);
    expect(runtime.deliveries?.has(child)).toBe(false);
  });
});
