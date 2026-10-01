import { describe, expect, it, vi } from 'vitest';
import { blueprint } from '../../blueprint';
import type { BlueprintGate, BlueprintSchema } from '../../blueprint';
import type { Validator } from '../type';
import { readSchemaNodeGuard } from '../utils/guard/readSchemaNodeGuard';
import { compileEntryGuards } from '../utils/guard/compileEntryGuards';
import { readValidationEntry } from '../utils/cache/readValidationEntry';
import { evictValidationRoot } from '../utils/lifetime/evictValidationRoot';
import { createTestValidator } from '../../__tests__/fixtures/createTestValidator';

/** Locate the authored condition instead of making a test-only gate. */
const firstIfGate = (schema: { type: string; if: object; then: object }): BlueprintGate => {
  const analysis = blueprint(schema);
  const gate = analysis.root.declarations.flatMap((declaration) =>
    declaration.gates).find((candidate) => candidate.kind === 'if');
  if (!gate) throw new Error('Expected an authored if gate');
  return gate;
};

describe('schema node guards', () => {
  it('VALIDATE-019 shares one copy across compile, every guard, and release', () => {
    const schema = { $id: 'https://example.test/identity-root', type: 'object',
      $defs: { enabled: { const: true } },
      if: { properties: { enabled: { $ref: '#/$defs/enabled' } } },
      then: { type: 'object' },
      allOf: [{ if: { required: ['enabled'] }, then: { type: 'object' } }] };
    const analysis = blueprint(schema);
    const compile = vi.fn((_copy: BlueprintSchema) => () => null);
    const compileGuard = vi.fn((_root: BlueprintSchema, _pointer: string) => () => true);
    const release = vi.fn((_root: BlueprintSchema) => undefined);
    const validator: Validator = { compile, compileGuard, release };
    const gate = firstIfGate(schema);
    const runtime = { blueprint: analysis, validator };
    readSchemaNodeGuard(runtime, gate);
    const entry = readValidationEntry(validator, schema);
    compileEntryGuards(entry, validator, analysis);
    evictValidationRoot(validator, schema);
    evictValidationRoot(validator, schema);

    const copy = compile.mock.calls[0][0];
    expect(copy).not.toBe(schema);
    expect(copy).toHaveProperty('$defs.enabled');
    expect(compileGuard).toHaveBeenCalledTimes(2);
    expect(compileGuard.mock.calls.map(([, pointer]) => pointer))
      .toEqual(expect.arrayContaining(['/if', '/allOf/0/if']));
    for (const [guardRoot] of compileGuard.mock.calls)
      expect(guardRoot).toBe(copy);
    expect(release).toHaveBeenCalledExactlyOnceWith(copy);
  });

  it('VALIDATE-044 evaluates a synchronous boolean guard at the authored position', () => {
    const schema = { type: 'object', if: { properties: { enabled: { const: true } },
      required: ['enabled'] }, then: { type: 'object' } };
    const gate = firstIfGate(schema);
    const compileGuard = vi.fn(() => (value: unknown) =>
      typeof value === 'object' && value !== null &&
      'enabled' in value && value.enabled === true);
    const validator: Validator = { compile: () => () => null, compileGuard };
    const runtime = { blueprint: blueprint(schema), validator };
    const guard = readSchemaNodeGuard(runtime, gate);
    expect(guard?.({ enabled: true })).toBe(true);
    expect(guard?.({ enabled: false })).toBe(false);
    expect(compileGuard).toHaveBeenCalledWith(
      readValidationEntry(validator, schema).copy, '/if');
    expect(readSchemaNodeGuard(runtime, gate)).toBe(guard);
    expect(compileGuard).toHaveBeenCalledTimes(1);
  });

  it('ERROR-041 caches compile failures and does not compile an unevaluated production guard', () => {
    const schema = { type: 'object', if: {}, then: { type: 'object' } };
    const gate = firstIfGate(schema);
    const compileGuard = vi.fn(() => { throw new Error('bad guard'); });
    const validator: Validator = { compile: () => () => null, compileGuard };
    const runtime = { blueprint: blueprint(schema), validator };
    expect(compileGuard).not.toHaveBeenCalled();
    expect(() => readSchemaNodeGuard(runtime, gate)).toThrow('bad guard');
    expect(() => readSchemaNodeGuard(runtime, gate)).toThrow('bad guard');
    expect(compileGuard).toHaveBeenCalledTimes(1);
  });

  it('VALIDATE-048 compiles all authored guards once per cache entry in development', () => {
    const schema = { type: 'object', allOf: [{ if: {}, then: { type: 'object' } },
      { if: { type: 'object' }, then: { type: 'object' } }] };
    const analysis = blueprint(schema);
    const compileGuard = vi.fn(() => () => true);
    const validator: Validator = { compile: () => () => null, compileGuard };
    const entry = readValidationEntry(validator, schema);
    compileEntryGuards(entry, validator, analysis);
    compileEntryGuards(entry, validator, analysis);
    expect(compileGuard).toHaveBeenCalledTimes(2);
  });

  it('ERROR-198 leaves vacuous if contents to the validator without warning', () => {
    const schema = { type: 'object', if: {}, then: { type: 'object' } };
    const gate = firstIfGate(schema);
    const validator: Validator = { compile: () => () => null,
      compileGuard: () => () => true };
    const report = vi.fn();
    const runtime = { blueprint: blueprint(schema), validator,
      errorReporter: { report, hasConsumer: () => true } };
    expect(readSchemaNodeGuard(runtime, gate)?.({})).toBe(true);
    expect(report).not.toHaveBeenCalled();
  });

  it('VALIDATE-047 resolves guard references in the authored root context', () => {
    const schema = { $id: 'https://example.test/guard-root', type: 'object',
      $defs: { enabled: { properties: { enabled: { const: true } },
        required: ['enabled'] } },
      if: { $ref: '#/$defs/enabled' },
      then: { properties: { guarded: { type: 'string' } } } };
    const gate = firstIfGate(schema);
    const guard = readSchemaNodeGuard({ blueprint: blueprint(schema),
      validator: createTestValidator() }, gate);
    expect(guard?.({ enabled: true })).toBe(true);
    expect(guard?.({ enabled: false })).toBe(false);
  });
});
