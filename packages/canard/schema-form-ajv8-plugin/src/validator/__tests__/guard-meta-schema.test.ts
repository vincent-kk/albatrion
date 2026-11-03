import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';
import { ajvValidatorPlugin } from '../../default/validatorPlugin';
import * as sibling from '../utils/makeSibling';
import { pluginRegistrations } from './utils/pluginRegistrations';
import { unrelatedViolation } from './utils/unrelatedViolation';

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

describe.each([
  { dialect: 'default', plugin: ajvValidatorPlugin, Constructor: Ajv },
  { dialect: '2019', plugin: plugin2019, Constructor: Ajv2019 },
  { dialect: '2020', plugin: plugin2020, Constructor: Ajv2020 },
] as const)('IR-10 guard meta-schema $dialect', ({ dialect, plugin, Constructor }) => {
  it('compiles a self-contained guard beside an unrelated meta-schema violation', () => {
    plugin.bind(new Constructor({ strict: false }));
    for (const variant of ['no-id', 'root-id', 'nested-id']) {
      const root = unrelatedViolation(variant, `${dialect}-t1`, condition);
      const guard = attempt(() => plugin.compileGuard(root, '/if'));
      expect.soft(guard.error, `T1 ${variant}: guard compiles`).toBeUndefined();
      expect.soft(verdict(guard, { kind: 'a' }), `T1 ${variant}: matching value`).toBe(true);
      expect.soft(verdict(guard, { kind: 'b' }), `T1 ${variant}: other value`).toBe(false);
      expect.soft(() => plugin.compile(root), `T1 ${variant}: compile throws`).toThrow();
      plugin.release(root);
      plugin.bind(new Constructor({ strict: false }));
      expect
        .soft(() => plugin.compile(root), `T1 ${variant}: compile on a fresh instance`)
        .toThrow(META_VIOLATION);
      plugin.release(root);
    }
  });
});

describe('IR-10 guard meta-schema default', () => {
  it('compiles root-pointer guards beside an unrelated meta-schema violation', () => {
    ajvValidatorPlugin.bind(new Ajv({ strict: false }));
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

  it('registers a root only for root-pointer guards and for the compile of a $id root', () => {
    const instance = new Ajv({ strict: false });
    ajvValidatorPlugin.bind(instance);
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
    const instance = new Ajv({ strict: false });
    ajvValidatorPlugin.bind(instance);
    const addSchema = vi.spyOn(Ajv.prototype, 'addSchema');
    const removeSchema = vi.spyOn(Ajv.prototype, 'removeSchema');
    const makeSibling = vi.spyOn(sibling, 'makeSibling');
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
    expect.soft(makeSibling, 'T6 guard instances').toHaveBeenCalledTimes(1);
    expect.soft(direct({ kind: 'a' }), 'T6 direct guard, matching value').toBe(true);
    expect.soft(direct({ kind: 'b' }), 'T6 direct guard, other value').toBe(false);
    ajvValidatorPlugin.release(root);
    const removedKeys = removeSchema.mock.calls.filter(
      ([key], index) =>
        typeof key === 'string' && key.startsWith(sibling.PLUGIN_KEY_PREFIX) && removeSchema.mock.contexts[index] !== instance,
    );
    expect.soft(removedKeys.length, 'T6 release removes the guard registration').toBeGreaterThan(0);
  });

  it('evaluates meta-only violations inside the condition with the generated code', () => {
    ajvValidatorPlugin.bind(new Ajv({ strict: false }));
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
    const instance = new Ajv({ strict: false });
    ajvValidatorPlugin.bind(instance);
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

  it('keeps consumer registrations, aliases and order after a failed registration', () => {
    const instance = new Ajv({ strict: false });
    ajvValidatorPlugin.bind(instance);
    instance.addSchema({ $id: 'https://example.test/ir10-x', type: 'string' });
    const clash: JSONSchema = { $id: 'https://example.test/ir10-x', type: 'number' };
    expect.soft(() => ajvValidatorPlugin.compile(clash), 'T9 same $id as a consumer schema').toThrow(/already exists/);
    expect.soft(instance.getSchema('https://example.test/ir10-x')?.('abc'), 'T9 consumer schema kept').toBe(true);
    const reference = attempt(() => instance.compile({ $ref: 'https://example.test/ir10-x' }));
    expect.soft(reference.value?.('abc'), 'T9 consumer schema referenced').toBe(true);

    instance.refs['https://example.test/ir10-alias'] = 'https://example.test/ir10-x#/$defs/a';
    const aliased: JSONSchema = {
      $id: 'https://example.test/ir10-d',
      $defs: { a: { $id: 'https://example.test/ir10-alias', type: 'string' } },
      properties: { count: { type: 'number', multipleOf: 0 } },
    };
    expect.soft(() => ajvValidatorPlugin.compile(aliased), 'T9 nested $id root').toThrow(META_VIOLATION);
    expect.soft(instance.refs['https://example.test/ir10-alias'], 'T9 consumer alias kept').toBe(
      'https://example.test/ir10-x#/$defs/a',
    );

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
    const order = Object.keys(instance.schemas);
    expect.soft(
      order.indexOf('https://example.test/ir10-meta') < order.indexOf('https://example.test/ir10-s'),
      'T9 meta-schema stays ahead of its user',
    ).toBe(true);
    expect.soft(attempt(() => sibling.makeSibling(instance, false)).error, 'T9 sibling construction').toBeUndefined();
    for (const root of [clash, aliased, metaClash]) ajvValidatorPlugin.release(root);
  });
});
