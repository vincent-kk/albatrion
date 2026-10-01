import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Validator } from '../validation';
import { dispatchMount, dispatchSetValue } from '../dispatch';
import { createDispatchTree } from '../dispatch/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '../types/state';
import { createTestValidator } from './fixtures/createTestValidator';

/** One conditional tree whose guard can be evaluated at mount or later. */
const schema = { type: 'object', properties: {
  enabled: { type: 'boolean' },
}, if: { properties: { enabled: { const: true } },
  required: ['enabled'] }, then: { properties: { guarded: { type: 'string' } } } };

afterEach(() => vi.unstubAllEnvs());

describe('guard records at public entry boundaries', () => {
  it('ERROR-146 ERROR-153 warns once after mount with no validator, including an ungated tree', () => {
    const seen: { code: string; commit?: number }[] = [];
    const reporter = { hasConsumer: () => true,
      report: (record: { code: string }) => seen.push({ code: record.code,
        commit: runtime.commitNumber }) };
    const { root, runtime } = createDispatchTree(schema, undefined, undefined,
      reporter);
    dispatchMount(root, { enabled: true });
    dispatchSetValue(root, { enabled: false });
    expect(seen.filter((record) => record.code ===
      'SCHEMA_FORM_WARNING.VALIDATOR_MISSING')).toEqual([
      { code: 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING', commit: 1 },
    ]);
    expect(seen.filter((record) => record.code ===
      'SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR'))
      .toHaveLength(1);
    const plain = createDispatchTree({ type: 'string' }, undefined, undefined,
      { hasConsumer: () => true,
        report: (record) => seen.push({ code: record.code,
          commit: plain.runtime.commitNumber }) });
    dispatchMount(plain.root, 'value');
    expect(seen.filter((record) => record.code ===
      'SCHEMA_FORM_WARNING.VALIDATOR_MISSING')).toHaveLength(2);
  });

  it('ERROR-151 suppresses the missing-validator warning in None mode', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree({ type: 'string' }, undefined,
      undefined, { report, hasConsumer: () => true });
    runtime.validationMode = ValidationMode.None;
    dispatchMount(root, 'value');
    expect(report).not.toHaveBeenCalled();
  });
  it('ERROR-041 dev compiles once and each consuming tree records after mount commit at sink', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const compileGuard = vi.fn(() => { throw new Error('bad guard'); });
    const validator: Validator = { compile: () => () => null, compileGuard };
    const seen: { code: string; surface?: string; commit?: number }[] = [];
    for (let index = 0; index < 2; index += 1) {
      let commit = 0;
      const reporter = { hasConsumer: () => true,
        report: (record: { code: string; surface?: string }) =>
          seen.push({ ...record, commit }) };
      const { root, runtime } = createDispatchTree(schema, undefined, validator,
        reporter);
      Object.defineProperty(reporter, 'report', { value: (record: {
        code: string; surface?: string }) => seen.push({ ...record,
          commit: runtime.commitNumber }) });
      dispatchMount(root, { enabled: true });
      commit = runtime.commitNumber ?? 0;
      expect(commit).toBeGreaterThan(0);
      expect(() => dispatchSetValue(root, { enabled: false })).toThrow('Gate evaluation failed');
      expect(seen.filter((record) => record.code ===
        'SCHEMA_FORM_ERROR.GUARD_FAILED')).toHaveLength(index + 1);
    }
    expect(compileGuard).toHaveBeenCalledTimes(1);
    expect(seen.filter((record) => record.code ===
      'SCHEMA_FORM_ERROR.GUARD_FAILED')).toEqual([
      expect.objectContaining({ surface: 'sink', commit: 1 }),
      expect.objectContaining({ surface: 'sink', commit: 1 }),
    ]);
  });

  it('ERROR-041 production skips unevaluated guards and reports first failure after commit', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const compileGuard = vi.fn(() => { throw new Error('bad guard'); });
    const validator: Validator = { compile: () => () => null, compileGuard };
    const records: { code: string; surface?: string; commit?: number }[] = [];
    const reporter = { hasConsumer: () => true,
      report: (record: { code: string; surface?: string }) =>
        records.push(record) };
    const { root, runtime } = createDispatchTree(schema, undefined, validator,
      reporter);
    expect(compileGuard).not.toHaveBeenCalled();
    expect(records).toEqual([]);
    expect(() => dispatchMount(root, { enabled: false })).toThrow('Gate evaluation failed');
    expect(compileGuard).toHaveBeenCalledTimes(1);
    expect(records.filter((record) => record.code ===
      'SCHEMA_FORM_ERROR.GUARD_FAILED')).toEqual([
      expect.objectContaining({ surface: 'thrown' }),
    ]);
    expect(runtime.commitNumber).toBeGreaterThan(0);
    expect(() => dispatchSetValue(root, { enabled: true })).toThrow();
    expect(() => dispatchSetValue(root, { enabled: false })).toThrow();
    expect(() => dispatchSetValue(root, { enabled: true })).toThrow();
    expect(records.filter((record) => record.code ===
      'SCHEMA_FORM_ERROR.GUARD_FAILED')).toHaveLength(1);
    expect(compileGuard).toHaveBeenCalledTimes(1);
  });

  it('VALIDATE-044 treats a Promise-returning guard as GUARD_FAILED', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const report = vi.fn();
    const { root } = createDispatchTree(schema, undefined,
      createTestValidator('promise'), { report, hasConsumer: () => true });
    expect(() => dispatchMount(root, { enabled: true })).toThrow('Gate evaluation failed');
    expect(report).toHaveBeenCalledWith(expect.objectContaining({
      code: 'SCHEMA_FORM_ERROR.GUARD_FAILED', surface: 'thrown',
    }));
  });
});
