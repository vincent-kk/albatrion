import { describe, expect, it, vi } from 'vitest';

import { createTestValidator } from '../../__tests__/fixtures/createTestValidator';
import { SchemaNodeEventType, SchemaNodeRequestType } from '../../record';
import { NodeState, ValidationMode } from '../../types/state';
import type { Validator } from '../../validation';
import { dispatchMount, dispatchRequest, dispatchSetState, dispatchSetValue,
  subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-observers
describe('standalone wave failures', () => {
  it('ERROR-023 ERROR-041 reports a throwing guard in a standalone request once', () => {
    const report = vi.fn();
    const { root } = createDispatchTree({
      type: 'object', if: {},
      then: { properties: { guarded: { type: 'string' } } },
    }, undefined, createTestValidator('throw'), { hasConsumer: () => true, report });
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeRequestType.Focus)
        dispatchSetValue(root, { enabled: true });
    });

    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus)).toThrow(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED' }));
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.GUARD_FAILED', surface: 'thrown',
    });
  });

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

  it('ERROR-004 ERROR-023 reports an onChange write listener failure once', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { a: 'before', b: 'before' });
    report.mockClear();
    const a = getDispatchChild(root, 'a');
    const b = getDispatchChild(root, 'b');
    const failure = new Error('onChange write listener');
    let changed = false;
    runtime.onChange = () => {
      if (!changed) { changed = true; dispatchSetValue(b, 'after'); }
    };
    subscribeSchemaNode(b, (event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) throw failure;
    });

    expect(() => dispatchSetValue(a, 'after')).toThrow(failure);
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({ error: failure, surface: 'thrown' });
  });

  it('ERROR-004 ERROR-023 reports a state listener failure inside onChange once', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { a: 'before', b: 'before' });
    report.mockClear();
    const a = getDispatchChild(root, 'a');
    const b = getDispatchChild(root, 'b');
    const failure = new Error('onChange state listener');
    let changed = false;
    runtime.onChange = () => {
      if (!changed) { changed = true; dispatchSetState(root, { [NodeState.Dirty]: true }); }
    };
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState) dispatchSetValue(b, 'after');
    });
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState) throw failure;
    });

    expect(() => dispatchSetValue(a, 'after')).toThrow(failure);
    expect(b.emit).toBe('after');
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({ error: failure, surface: 'thrown' });
  });

  it('ERROR-004 preserves a request collector across an onChange nested entry', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { a: 'before', b: 'before' });
    report.mockClear();
    const a = getDispatchChild(root, 'a');
    const b = getDispatchChild(root, 'b');
    const failure = new Error('request listener after nested onChange');
    let changed = false;
    runtime.onChange = () => {
      if (!changed) { changed = true; dispatchSetValue(a, 'from onChange'); }
    };
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeRequestType.Focus) dispatchSetValue(b, 'after');
    });
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeRequestType.Focus) throw failure;
    });

    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus)).toThrow(failure);
    expect(a.emit).toBe('from onChange');
    expect(b.emit).toBe('after');
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({ error: failure, surface: 'thrown' });
  });

  it('EVENT-034 ERROR-023 records the 26th onChange failure once', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'number' }, undefined,
      undefined, { hasConsumer: () => true, report });
    let changes = 0;
    runtime.onChange = () => { changes += 1; dispatchSetValue(root, changes); };
    let failure: unknown;
    try { dispatchSetValue(root, 0); }
    catch (error) { failure = error; }

    expect(failure).toMatchObject({ code: 'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED' });
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED', surface: 'thrown',
    });
  });

  it('ERROR-019 keeps an earlier outer occurrence before a nested listener failure', () => {
    const report = vi.fn();
    const { root } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    } }, undefined, undefined, { hasConsumer: () => true, report });
    dispatchMount(root, { child: 'before' });
    report.mockClear();
    const child = getDispatchChild(root, 'child');
    const first = new Error('first listener');
    const second = new Error('nested listener');
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeRequestType.Focus) throw first;
    });
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeRequestType.Focus) dispatchSetValue(child, 'after');
    });
    subscribeSchemaNode(child, (event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) throw second;
    });

    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus)).toThrow();
    expect(report.mock.calls.map(([record]) => record.error)).toEqual([first, second]);
  });

  it('ERROR-019 gives a nested validation-result write the sink surface', async () => {
    const report = vi.fn();
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const validator: Validator = { compile: () => () => [
        { dataPath: '', message: 'invalid' }], compileGuard: () => () => true };
      const { root, runtime } = createDispatchTree({ type: 'object', properties: {
        a: { type: 'string' }, b: { type: 'string' },
      } }, undefined, validator, { hasConsumer: () => true, report });
      dispatchMount(root, { a: 'before', b: 'before' });
      report.mockClear();
      runtime.validationMode = ValidationMode.OnChange;
      const a = getDispatchChild(root, 'a');
      const b = getDispatchChild(root, 'b');
      const failure = new Error('nested result listener');
      let written = false;
      subscribeSchemaNode(root, (event) => {
        if (event.type & SchemaNodeEventType.UpdateGlobalError && !written) {
          written = true;
          dispatchSetValue(b, 'after');
        }
      });
      subscribeSchemaNode(b, (event) => {
        if (event.type & SchemaNodeEventType.UpdateValue) throw failure;
      });

      dispatchSetValue(a, 'after');
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(report).toHaveBeenCalledTimes(1);
      expect(report.mock.calls[0][0]).toMatchObject({ error: failure, surface: 'sink' });
      expect(sink).toHaveBeenCalledTimes(1);
    } finally { sink.mockRestore(); }
  });
});
