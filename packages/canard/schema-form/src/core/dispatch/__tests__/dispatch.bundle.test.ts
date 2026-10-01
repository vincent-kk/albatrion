import { describe, expect, it, vi } from 'vitest';

import { MULTIPLE_ERRORS, SchemaFormError } from '../../../errors';
import { dispatchSetValue, subscribeSchemaNode } from '../index';
import { bundleChainErrors } from '../utils/report/bundleChainErrors';
import { deliverChainRecords } from '../utils/report/deliverChainRecords';
import { createDispatchTree } from './fixtures/createDispatchTree';

// filid:contract dispatch-report
describe('chain failure bundles', () => {
  it('ERROR-005 ERROR-017 preserves occurrence order and the original values', () => {
    const first = new Error('first');
    const second = { raw: true };
    const result = bundleChainErrors([first, second]);
    expect(result).toBeInstanceOf(SchemaFormError);
    if (!(result instanceof SchemaFormError)) throw new Error('Expected aggregate');
    expect(result.code).toBe(`SCHEMA_FORM_ERROR.${MULTIPLE_ERRORS}`);
    expect(result.details.errors).toEqual([first, second]);
    expect(bundleChainErrors([first])).toBe(first);
  });

  it('ERROR-028 completes deliveries and bundles the handler failure behind the original', () => {
    const first = new Error('listener');
    const handler = new Error('handler');
    const seen: unknown[] = [];
    const { root } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report: (record) => {
        seen.push(record.error);
        if (record.error === first) throw handler;
      } });
    subscribeSchemaNode(root, () => { throw first; });
    subscribeSchemaNode(root, () => { throw new Error('second'); });
    let caught: unknown;
    try { dispatchSetValue(root, 'value'); } catch (error) { caught = error; }
    expect(seen).toHaveLength(2);
    expect(caught).toBeInstanceOf(SchemaFormError);
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected aggregate');
    const components = caught.details.errors;
    expect(components).toEqual([expect.any(SchemaFormError), handler]);
    expect(Array.isArray(components) && components[0]).toBeInstanceOf(SchemaFormError);
  });

  it('ERROR-028 a warning-only handler failure is thrown once', () => {
    const error = new Error('handler');
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report: () => { throw error; } });
    runtime.pendingWarningRecords = new Map([['warning', {
      level: 'warning', code: 'SCHEMA_FORM_WARNING.TYPE_MISMATCH', message: 'warning',
    }]]);
    expect(() => dispatchSetValue(root, 'value')).toThrow(error);
  });

  it('ERROR-028 ownerless delivery sinks handler failure once and continues', () => {
    const original = new Error('original');
    const handler = new Error('handler');
    const seen: string[] = [];
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report: (record) => {
        seen.push(record.message);
        if (record.message === 'first') throw handler;
      } });
    try {
      const failures = deliverChainRecords(runtime, [
        { level: 'warning', code: 'SCHEMA_FORM_WARNING.TYPE_MISMATCH',
          message: 'first' },
        { level: 'warning', code: 'SCHEMA_FORM_WARNING.TYPE_MISMATCH',
          message: 'second' },
      ], original, false);
      expect(failures).toEqual([]);
      expect(seen).toEqual(['first', 'second']);
      expect(sink.mock.calls).toEqual([[handler], [original]]);
    } finally { sink.mockRestore(); }
  });

  it('ERROR-017 ERROR-023 puts the actual aggregate on each component record', () => {
    const first = new SchemaFormError('GUARD_FAILED', 'first', { path: '/a' });
    const second = new Error('second');
    const records: { error?: unknown; aggregate?: SchemaFormError;
      details?: unknown }[] = [];
    const { root } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report: (record) => records.push(record) });
    subscribeSchemaNode(root, () => { throw first; });
    subscribeSchemaNode(root, () => { throw second; });
    let thrown: unknown;
    try { dispatchSetValue(root, 'value'); } catch (error) { thrown = error; }
    expect(thrown).toBeInstanceOf(SchemaFormError);
    expect(records.map((record) => record.error)).toEqual([first, second]);
    expect(records[0].details).toBe(first.details);
    expect(records.map((record) => record.aggregate)).toEqual([thrown, thrown]);
  });
});
