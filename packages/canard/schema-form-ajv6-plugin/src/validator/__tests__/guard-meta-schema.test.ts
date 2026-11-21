import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as sibling from '../utils/cloneInstance';
import { unrelatedViolation } from './utils/unrelatedViolation';
import { ajvValidatorPlugin } from '../validatorPlugin';

/** Valid `if` condition shared by the roots below: `kind` must equal `'a'`. */
const condition: JSONSchema = { properties: { kind: { const: 'a' } }, required: ['kind'] };
/** AJV's root meta-schema rejection, reported by message or by the offending keyword. */
const META_VIOLATION = /multipleOf|schema is invalid/;

/**
 * Run a call and keep its result or its exception, so every later assertion still runs.
 * @param run - The call under test
 * @returns `value` when the call returned, `error` when it threw
 */
const attempt = <T>(run: () => T): { value?: T; error?: unknown } => {
  try {
    return { value: run() };
  } catch (error) {
    return { error };
  }
};

/**
 * Evaluate a compiled guard, or surface the compile exception when no guard was returned.
 * @param compiled - Result of `attempt` around `compileGuard`
 * @param value - Data the guard evaluates
 * @returns The guard's boolean verdict, or the exception that prevented compilation
 */
const verdict = (
  compiled: { value?: (value: unknown) => boolean; error?: unknown },
  value: unknown,
): unknown => (compiled.value ? compiled.value(value) : compiled.error);

afterEach(() => {
  ajvValidatorPlugin.configure({ directGuardCompile: true });
  vi.restoreAllMocks();
});

describe('IR-10 guard meta-schema', () => {
  it('compiles a self-contained guard beside an unrelated meta-schema violation', () => {
    ajvValidatorPlugin.bind?.(new Ajv());
    for (const variant of ['no-id', 'root-id', 'nested-id']) {
      const root = unrelatedViolation(variant, 't1', condition);
      const guard = attempt(() => ajvValidatorPlugin.compileGuard(root, '/if'));
      expect.soft(guard.error, `T1 ${variant}: guard compiles`).toBeUndefined();
      expect.soft(verdict(guard, { kind: 'a' }), `T1 ${variant}: matching value`).toBe(true);
      expect.soft(verdict(guard, { kind: 'b' }), `T1 ${variant}: other value`).toBe(false);
      expect.soft(() => ajvValidatorPlugin.compile(root), `T1 ${variant}: compile throws`).toThrow();
      ajvValidatorPlugin.release(root);
      ajvValidatorPlugin.bind?.(new Ajv());
      expect
        .soft(() => ajvValidatorPlugin.compile(root), `T1 ${variant}: compile on a fresh instance`)
        .toThrow(META_VIOLATION);
      ajvValidatorPlugin.release(root);
    }
  });

  it('compiles root-pointer guards beside an unrelated meta-schema violation', () => {
    ajvValidatorPlugin.bind?.(new Ajv());
    ajvValidatorPlugin.configure({ directGuardCompile: false });
    const pointerRoot = unrelatedViolation('no-id', 't2', condition);
    const pointerGuard = attempt(() => ajvValidatorPlugin.compileGuard(pointerRoot, '/if'));
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    const referenceRoot: JSONSchema = {
      ...unrelatedViolation('no-id', 't2', condition),
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

  it('keeps direct and contextual guards independent of application addresses', () => {
    const instance = new Ajv();
    ajvValidatorPlugin.bind?.(instance);
    const root: JSONSchema = {
      $id: 'https://example.test/private-guards',
      type: 'object',
      definitions: { isX: { required: ['x'] }, isY: { required: ['y'] } },
      if: condition,
      then: { if: { $ref: '#/definitions/isX' } },
      else: { if: { $ref: '#/definitions/isY' } },
    };
    const direct = ajvValidatorPlugin.compileGuard(root, '/if');
    const first = ajvValidatorPlugin.compileGuard(root, '/then/if');
    const second = ajvValidatorPlugin.compileGuard(root, '/else/if');
    expect(direct({ kind: 'a' })).toBe(true);
    expect(direct({ kind: 'b' })).toBe(false);
    expect([first({ x: 1 }), first({ y: 1 })]).toEqual([true, false]);
    expect([second({ x: 1 }), second({ y: 1 })]).toEqual([false, true]);
    ajvValidatorPlugin.release(root);
    expect(instance.getSchema(root.$id!)).toBeUndefined();
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
    const keptValidator = ajvValidatorPlugin.compile(kept);
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
    expect.soft(await keptValidator('x'), 'T8 earlier compiled root remains valid').toBeNull();
    expect.soft(instance.getSchema('https://example.test/ir10-b'), 'T8 form address is private').toBeUndefined();
    instance.addSchema(kept);
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
    expect.soft(attempt(() => sibling.cloneInstance(instance, 'guard')).error, 'T9 sibling construction').toBeUndefined();
    for (const root of [clash, metaClash]) ajvValidatorPlugin.release(root);
  });
});
