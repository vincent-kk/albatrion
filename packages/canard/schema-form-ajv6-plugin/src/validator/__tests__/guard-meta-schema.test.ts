import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as sibling from '../utils/cloneInstance';
import { ajvValidatorPlugin } from '../validatorPlugin';

const PLUGIN_KEY = 'urn:canard:schema-form:ajv6:';
const condition = { properties: { kind: { const: 'a' } }, required: ['kind'] };
const META_VIOLATION = /multipleOf|schema is invalid/;

/** Run a call and keep its result or its exception, so every later assertion still runs. */
const attempt = <T>(run: () => T): { value?: T; error?: unknown } => {
  try {
    return { value: run() };
  } catch (error) {
    return { error };
  }
};

/** The guard's verdict, or the compile exception when no guard was returned. */
const verdict = (
  compiled: { value?: (value: unknown) => boolean; error?: unknown },
  value: unknown,
): unknown => (compiled.value ? compiled.value(value) : compiled.error);

/** A root whose unrelated `count` field fails the meta-schema while its condition is valid. */
const unrelatedViolation = (variant: string, serial: string): JSONSchema => ({
  ...(variant === 'root-id' ? { $id: `https://example.test/ir10-root-${serial}` } : {}),
  type: 'object',
  properties: {
    kind: { type: 'string' },
    count: { type: 'number', multipleOf: 0 },
  },
  ...(variant === 'nested-id'
    ? { definitions: { other: { $id: `https://example.test/ir10-nested-${serial}`, type: 'string' } } }
    : {}),
  if: condition,
  then: { required: ['count'] },
});

/** Registrations made with this plugin's keys, with the instance that received each. */
const pluginRegistrations = (spy: { mock: { calls: unknown[][]; contexts: unknown[] } }) =>
  spy.mock.calls.flatMap(([, key], index) =>
    typeof key === 'string' && key.startsWith(PLUGIN_KEY) ? [spy.mock.contexts[index]] : [],
  );

afterEach(() => {
  ajvValidatorPlugin.configure({ directGuardCompile: true });
  vi.restoreAllMocks();
});

describe('IR-10 guard meta-schema', () => {
  it('compiles a self-contained guard beside an unrelated meta-schema violation', () => {
    ajvValidatorPlugin.bind?.(new Ajv());
    for (const variant of ['no-id', 'root-id', 'nested-id']) {
      const root = unrelatedViolation(variant, 't1');
      const guard = attempt(() => ajvValidatorPlugin.compileGuard(root, '/if'));
      expect.soft(guard.error, `T1 ${variant}: guard compiles`).toBeUndefined();
      expect.soft(verdict(guard, { kind: 'a' }), `T1 ${variant}: matching value`).toBe(true);
      expect.soft(verdict(guard, { kind: 'b' }), `T1 ${variant}: other value`).toBe(false);
      expect.soft(() => ajvValidatorPlugin.compile(root), `T1 ${variant}: compile throws`).toThrow();
      ajvValidatorPlugin.release(root);
    }
  });

  it('compiles root-pointer guards beside an unrelated meta-schema violation', () => {
    ajvValidatorPlugin.bind?.(new Ajv());
    ajvValidatorPlugin.configure({ directGuardCompile: false });
    const pointerRoot = unrelatedViolation('no-id', 't2');
    const pointerGuard = attempt(() => ajvValidatorPlugin.compileGuard(pointerRoot, '/if'));
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    const referenceRoot: JSONSchema = {
      ...unrelatedViolation('no-id', 't2'),
      definitions: { isA: condition },
      if: { $ref: '#/definitions/isA' },
    };
    const referenceGuard = attempt(() => ajvValidatorPlugin.compileGuard(referenceRoot, '/if'));
    for (const [label, guard] of [['directGuardCompile false', pointerGuard], ['$ref', referenceGuard]] as const) {
      expect.soft(guard.error, `T2 ${label}: guard compiles`).toBeUndefined();
      expect.soft(verdict(guard, { kind: 'a' }), `T2 ${label}: matching value`).toBe(true);
      expect.soft(verdict(guard, { kind: 'b' }), `T2 ${label}: other value`).toBe(false);
    }
    ajvValidatorPlugin.release(pointerRoot);
    ajvValidatorPlugin.release(referenceRoot);
  });

  it('registers a root only for root-pointer guards and for the compile of a $id root', () => {
    const instance = new Ajv();
    ajvValidatorPlugin.bind?.(instance);
    const addSchema = vi.spyOn(Ajv.prototype, 'addSchema');
    const plain: JSONSchema = { type: 'object', if: condition };
    ajvValidatorPlugin.compileGuard(plain, '/if');
    expect.soft(pluginRegistrations(addSchema), 'T3 self-contained guard, no $id').toHaveLength(0);
    const identified: JSONSchema = { $id: 'https://example.test/ir10-t3', type: 'object', if: condition };
    ajvValidatorPlugin.compileGuard(identified, '/if');
    expect.soft(pluginRegistrations(addSchema), 'T3 self-contained guard, root $id').toHaveLength(0);
    addSchema.mockClear();
    ajvValidatorPlugin.compile(identified);
    expect.soft(pluginRegistrations(addSchema), 'T3 compile of a $id root').toEqual([instance]);
    addSchema.mockClear();
    ajvValidatorPlugin.compile(plain);
    expect.soft(pluginRegistrations(addSchema), 'T3 compile of a root without $id').toHaveLength(0);
    addSchema.mockClear();
    const reference: JSONSchema = { type: 'object', definitions: { isA: condition }, if: { $ref: '#/definitions/isA' } };
    ajvValidatorPlugin.compileGuard(reference, '/if');
    const registrations = pluginRegistrations(addSchema);
    expect.soft(registrations, 'T3 $ref guard').toHaveLength(1);
    expect.soft(registrations[0], 'T3 $ref guard instance').not.toBe(instance);
    for (const root of [plain, identified, reference]) ajvValidatorPlugin.release(root);
  });

  it('keeps one guard instance and one registration from a direct to two root-pointer guards', () => {
    const instance = new Ajv();
    ajvValidatorPlugin.bind?.(instance);
    const addSchema = vi.spyOn(Ajv.prototype, 'addSchema');
    const removeSchema = vi.spyOn(Ajv.prototype, 'removeSchema');
    const cloneInstance = vi.spyOn(sibling, 'cloneInstance');
    const root: JSONSchema = {
      type: 'object',
      definitions: { isX: { required: ['x'] }, isY: { required: ['y'] } },
      if: condition,
      then: { if: { $ref: '#/definitions/isX' } },
      else: { if: { $ref: '#/definitions/isY' } },
    };
    const direct = ajvValidatorPlugin.compileGuard(root, '/if');
    expect.soft(pluginRegistrations(addSchema), 'T6 after the direct guard').toHaveLength(0);
    ajvValidatorPlugin.compileGuard(root, '/then/if');
    expect.soft(pluginRegistrations(addSchema), 'T6 after the first root-pointer guard').toHaveLength(1);
    ajvValidatorPlugin.compileGuard(root, '/else/if');
    expect.soft(pluginRegistrations(addSchema), 'T6 after the second root-pointer guard').toHaveLength(1);
    expect.soft(cloneInstance, 'T6 guard instances').toHaveBeenCalledTimes(1);
    expect.soft(direct({ kind: 'a' }), 'T6 direct guard, matching value').toBe(true);
    expect.soft(direct({ kind: 'b' }), 'T6 direct guard, other value').toBe(false);
    ajvValidatorPlugin.release(root);
    const removedKeys = removeSchema.mock.calls.filter(
      ([key], index) =>
        typeof key === 'string' && key.startsWith(PLUGIN_KEY) && removeSchema.mock.contexts[index] !== instance,
    );
    expect.soft(removedKeys.length, 'T6 release removes the guard registration').toBeGreaterThan(0);
  });

  it('evaluates meta-only violations inside the condition with the generated code', () => {
    ajvValidatorPlugin.bind?.(new Ajv());
    const root: JSONSchema = {
      type: 'object',
      if: { properties: { kind: { type: 'string', minLength: 1.5 } }, required: ['kind', 'kind'] },
    };
    const guard = attempt(() => ajvValidatorPlugin.compileGuard(root, '/if'));
    expect.soft(guard.error, 'T7 guard compiles').toBeUndefined();
    expect.soft(verdict(guard, { kind: 'ab' }), 'T7 two characters').toBe(true);
    expect.soft(verdict(guard, { kind: 'a' }), 'T7 one character').toBe(false);
    expect.soft(() => ajvValidatorPlugin.compile(root), 'T7 compile throws').toThrow(META_VIOLATION);
    ajvValidatorPlugin.release(root);
  });

  it('rolls back a failed validation registration', async () => {
    const instance = new Ajv();
    ajvValidatorPlugin.bind?.(instance);
    const kept: JSONSchema = { $id: 'https://example.test/ir10-b', type: 'string' };
    ajvValidatorPlugin.compile(kept);
    const invalid: JSONSchema = {
      $id: 'https://example.test/ir10-a',
      type: 'object',
      properties: { count: { type: 'number', multipleOf: 0 } },
    };
    const first = attempt(() => ajvValidatorPlugin.compile(invalid));
    expect.soft(String(first.error), 'T8 first compile').toMatch(META_VIOLATION);
    const retry = attempt(() => ajvValidatorPlugin.compile(invalid));
    expect.soft(String(retry.error), 'T8 retry fails for the same reason').toMatch(META_VIOLATION);
    ajvValidatorPlugin.release(invalid);
    const valid: JSONSchema = {
      $id: 'https://example.test/ir10-a',
      type: 'object',
      properties: { count: { type: 'number' } },
    };
    const replacement = attempt(() => ajvValidatorPlugin.compile(valid));
    expect.soft(replacement.error, 'T8 same $id after release compiles').toBeUndefined();
    expect.soft(Array.isArray(await replacement.value?.({ count: 'x' })), 'T8 same $id rejects').toBe(true);
    expect.soft(await replacement.value?.({ count: 1 }), 'T8 same $id accepts').toBeNull();
    expect.soft(instance.getSchema('https://example.test/ir10-b'), 'T8 earlier root kept').toBeDefined();
    const reference = attempt(() => instance.compile({ $ref: 'https://example.test/ir10-b' }));
    expect.soft(reference.value?.('x'), 'T8 earlier root referenced').toBe(true);
    ajvValidatorPlugin.release(valid);
    ajvValidatorPlugin.release(kept);
  });

  it('keeps consumer registrations and order after a failed registration', () => {
    const instance = new Ajv();
    ajvValidatorPlugin.bind?.(instance);
    instance.addSchema({ $id: 'https://example.test/ir10-x', type: 'string' });
    const clash: JSONSchema = { $id: 'https://example.test/ir10-x', type: 'number' };
    expect.soft(() => ajvValidatorPlugin.compile(clash), 'T9 same $id as a consumer schema').toThrow(/already exists/);
    expect.soft(instance.getSchema('https://example.test/ir10-x')?.('abc'), 'T9 consumer schema kept').toBe(true);
    const reference = attempt(() => instance.compile({ $ref: 'https://example.test/ir10-x' }));
    expect.soft(reference.value?.('abc'), 'T9 consumer schema referenced').toBe(true);

    instance.addMetaSchema({
      $id: 'https://example.test/ir10-meta',
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
    });
    instance.addSchema({ $id: 'https://example.test/ir10-s', $schema: 'https://example.test/ir10-meta', type: 'string' });
    const metaClash: JSONSchema = { $id: 'https://example.test/ir10-meta', type: 'number' };
    expect.soft(() => ajvValidatorPlugin.compile(metaClash), 'T9 same $id as a consumer meta-schema').toThrow(
      /already exists/,
    );
    const order = Object.keys(instance._schemas);
    expect.soft(
      order.indexOf('https://example.test/ir10-meta') < order.indexOf('https://example.test/ir10-s'),
      'T9 meta-schema stays ahead of its user',
    ).toBe(true);
    expect.soft(attempt(() => sibling.cloneInstance(instance, false)).error, 'T9 sibling construction').toBeUndefined();
    for (const root of [clash, metaClash]) ajvValidatorPlugin.release(root);
  });
});
