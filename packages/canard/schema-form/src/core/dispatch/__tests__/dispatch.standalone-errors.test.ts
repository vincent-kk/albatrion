import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType, SchemaNodeRequestType } from '../../record';
import { NodeState } from '../../types/state';
import { dispatchMount, dispatchRequest, dispatchSetState, dispatchSetValue,
  subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-observers
describe('standalone wave failures', () => {
  it('EVENT-010 ERROR-004 31C-01 preserves a request failure after an earlier listener writes', () => {
    const report = vi.fn();
    const { root } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { child: 'before' });
    report.mockClear();
    const child = getDispatchChild(root, 'child');
    const failure = new Error('request listener');
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.RequestFocus)
        dispatchSetValue(child, 'after');
    });
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.RequestFocus) throw failure;
    });

    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus)).toThrow(failure);
    expect(child.emit).toBe('after');
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.LISTENER_THREW', error: failure, surface: 'thrown',
    });
  });

  it('EVENT-010 ERROR-004 31C-01 preserves a state failure before a later listener writes', () => {
    const report = vi.fn();
    const { root } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { child: 'before' });
    report.mockClear();
    const child = getDispatchChild(root, 'child');
    const failure = new Error('state listener');
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState) throw failure;
    });
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState)
        dispatchSetValue(child, 'after');
    });

    expect(() => dispatchSetState(root, { [NodeState.Dirty]: true })).toThrow(failure);
    expect(child.emit).toBe('after');
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.LISTENER_THREW', error: failure, surface: 'thrown',
    });
  });

  it('EVENT-010 ERROR-004 reports a nested write failure once to its enclosing request', () => {
    const report = vi.fn();
    const { root } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { child: 'before' });
    report.mockClear();
    const child = getDispatchChild(root, 'child');
    const failure = new Error('nested write listener');
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.RequestFocus)
        dispatchSetValue(child, 'after');
    });
    subscribeSchemaNode(child, (event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) throw failure;
    });

    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus)).toThrow(failure);
    expect(child.emit).toBe('after');
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.LISTENER_THREW', error: failure, surface: 'thrown',
    });
  });
});
