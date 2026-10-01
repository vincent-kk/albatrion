import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import type { BlueprintDiagnostic } from '../../blueprint';
import { dispatchMount, dispatchSetValue, subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { createFormErrorRecord } from '../utils/report/createFormErrorRecord';

// filid:contract dispatch-report
describe('chain error reporting', () => {
  it('ERROR-004 ERROR-019 ERROR-021 reports after delivery and onChange', () => {
    const order: string[] = [];
    const failure = new Error('listener');
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true,
        report: (record) => order.push(`report:${record.error === failure}`) });
    subscribeSchemaNode(root, () => { order.push('listener'); throw failure; });
    runtime.onChange = () => order.push('change');
    expect(() => dispatchSetValue(root, 'a')).toThrow(failure);
    expect(order).toEqual(['listener', 'change', 'report:true']);
  });

  it('ERROR-022 ERROR-023 ERROR-099 ERROR-101 preserves raw callback exceptions per event', () => {
    const raw = { reason: 'raw' };
    const seen: unknown[] = [];
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report: (record) => seen.push(record.error) });
    runtime.onChange = () => { throw raw; };
    for (const value of ['one', 'two']) {
      let caught: unknown;
      try { dispatchSetValue(root, value); } catch (error) { caught = error; }
      expect(caught).toBe(raw);
    }
    expect(seen).toEqual([raw, raw]);
  });

  it('ERROR-030 skips warning records and formatting without a consumer', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => false, report });
    dispatchMount(root, 3);
    expect(report).not.toHaveBeenCalled();
    expect(runtime.pendingWarningRecords?.size ?? 0).toBe(0);
    expect(runtime.warningKeys?.size ?? 0).toBe(0);
  });

  it('ERROR-030 allocates a record only after the consumer check', () => {
    const format = vi.fn(() => 'formatted');
    expect(createFormErrorRecord(false, 'SCHEMA_FORM_WARNING.TYPE_MISMATCH',
      'warning', format)).toBeUndefined();
    expect(format).not.toHaveBeenCalled();
    expect(createFormErrorRecord(true, 'SCHEMA_FORM_WARNING.TYPE_MISMATCH',
      'warning', format)?.message).toBe('formatted');
    expect(format).toHaveBeenCalledTimes(1);
  });

  it('ERROR-021 late observer receives only later entries', () => {
    const seen: unknown[] = [];
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.onChange = () => { throw new Error('callback'); };
    expect(() => dispatchSetValue(root, 'before')).toThrow();
    runtime.errorReporter = { hasConsumer: () => true,
      report: (record) => seen.push(record.error) };
    expect(() => dispatchSetValue(root, 'after')).toThrow();
    expect(seen).toHaveLength(1);
  });

  it('ERROR-019 preserves an earlier listener failure before a later warning', () => {
    const seen: string[] = [];
    const { root } = createDispatchTree({ type: 'object', properties: {
      amount: { type: 'number' },
    } }, undefined, undefined, { hasConsumer: () => true,
      report: (record) => seen.push(record.code) });
    const failure = new Error('listener first');
    let firstWave = true;
    subscribeSchemaNode(root, () => {
      if (firstWave) { firstWave = false; throw failure; }
    });
    subscribeSchemaNode(root, () => {
      const amount = root.structure?.amount;
      if (amount && amount.raw !== 'bad') dispatchSetValue(amount, 'bad');
    });
    expect(() => dispatchSetValue(root, { amount: 1 })).toThrow(failure);
    expect(seen).toEqual([
      'SCHEMA_FORM_ERROR.LISTENER_THREW',
      'SCHEMA_FORM_WARNING.TYPE_MISMATCH',
    ]);
  });

  it('ERROR-021 ERROR-030 reports two active oneOf gates only with a consumer', () => {
    const schema = { type: 'object', properties: { enabled: { type: 'boolean' } },
      oneOf: [
        { controls: { active: './enabled' }, properties: { a: { type: 'string' } } },
        { controls: { active: './enabled' }, properties: { b: { type: 'string' } } },
      ] };
    const report = vi.fn();
    const observed = createDispatchTree(schema, undefined, undefined,
      { hasConsumer: () => true, report });
    dispatchMount(observed.root, { enabled: true });
    expect(report).toHaveBeenCalledWith(expect.objectContaining({
      code: 'SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE',
    }));
    const absent = createDispatchTree(schema, undefined, undefined,
      { hasConsumer: () => false, report });
    report.mockClear();
    dispatchMount(absent.root, { enabled: true });
    expect(report).not.toHaveBeenCalled();
    expect(absent.runtime.warningKeys?.size ?? 0).toBe(0);
  });

  it('ERROR-019 ERROR-024 turns collected blueprint warnings into deferred records', () => {
    const seen: string[] = [];
    const { root } = createDispatchTree({ type: 'object',
      allOf: [{ not: { type: 'number' } }] }, undefined, undefined,
    { hasConsumer: () => true, report: (record) => seen.push(record.code) });
    expect(seen).toEqual([]);
    dispatchMount(root, {});
    expect(seen).toContain('SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM');
  });

  it('WRITE-099 31C-02 checks whole non-JSON values only in development', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const schema = { type: 'object', options: { terminal: true } };
    try {
      vi.stubEnv('NODE_ENV', 'development');
      const dev = createDispatchTree(schema);
      dispatchSetValue(dev.root, { bad: undefined });
      expect(consoleWarn.mock.calls.some((call) =>
        String(call[0]).includes('NON_JSON_WHOLE_VALUE'))).toBe(true);
      consoleWarn.mockClear();
      vi.stubEnv('NODE_ENV', 'production');
      const prod = createDispatchTree(schema);
      dispatchSetValue(prod.root, { bad: undefined });
      expect(consoleWarn).not.toHaveBeenCalled();
      expect(prod.runtime.warningKeys).toBeUndefined();
    } finally { vi.unstubAllEnvs(); consoleWarn.mockRestore(); }
  });

  it('ERROR-022 preserves an undefined value thrown by a callback', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { hasConsumer: () => true, report });
    runtime.onChange = () => { throw undefined; };
    let caught = false;
    try { dispatchSetValue(root, 'value'); }
    catch (error) { caught = true; expect(error).toBeUndefined(); }
    expect(caught).toBe(true);
    expect(report).toHaveBeenCalledWith(expect.objectContaining({ error: undefined }));
  });

  it('ERROR-019 converts a PR-1 blueprint failure diagnostic and its thrown value', () => {
    let diagnostic: BlueprintDiagnostic | undefined;
    let failure: unknown;
    try {
      blueprint({ type: 'string', controls: { typo: true } },
        { collect: (value) => { diagnostic = value; } });
    } catch (error) { failure = error; }
    if (!diagnostic) throw new Error('Expected the blueprint collector to run');
    const record = createFormErrorRecord(true, diagnostic, failure);
    expect(record).toMatchObject({ level: 'error',
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      schemaPath: expect.any(String), error: failure });
    if (failure && typeof failure === 'object' && 'details' in failure)
      expect(record?.details).toBe(failure.details);
  });

  it('ERROR-030 instruments warning and record allocation without a consumer', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'number' },
      undefined, undefined, { hasConsumer: () => false, report });
    let warningAllocations = 0;
    let recordAllocations = 0;
    Object.defineProperty(runtime, 'warningKeys', { configurable: true,
      get: () => undefined, set: () => { warningAllocations += 1; } });
    Object.defineProperty(runtime, 'pendingWarningRecords', { configurable: true,
      get: () => undefined, set: () => { recordAllocations += 1; } });
    dispatchSetValue(root, 'mismatch');
    expect(warningAllocations).toBe(0);
    expect(recordAllocations).toBe(0);
    expect(report).not.toHaveBeenCalled();
  });
});
