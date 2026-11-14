import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, describe, expect, it, vi } from 'vitest';

/** Loads an unused default binding or a fresh explicitly bound instance. */
const loadPlugin = async (mode: 'default' | 'bind', directGuardCompile: boolean) => {
  vi.resetModules();
  const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
  if (mode === 'bind') ajvValidatorPlugin.bind(new Ajv({ strictSchema: false }));
  ajvValidatorPlugin.configure({ directGuardCompile });
  return ajvValidatorPlugin;
};

/** A schema with a stable URI whose condition differs between live roots. */
const root = (kind: string): JSONSchema => JSON.parse(JSON.stringify({
  $id: 'https://example.test/shared-root',
  type: 'object',
  if: { type: 'object', properties: { kind: { const: kind } }, required: ['kind'] },
  then: { required: ['selected'] },
})) as JSONSchema;

describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
  afterEach(async () => {
    (await import('../../default/validatorPlugin')).ajvValidatorPlugin.configure({ directGuardCompile: true });
    (await import('../../2019/validatorPlugin')).ajvValidatorPlugin.configure({ directGuardCompile: true });
    (await import('../../2020/validatorPlugin')).ajvValidatorPlugin.configure({ directGuardCompile: true });
  });
describe('VALIDATE-046 same-id roots', () => {
  it.each(['default', 'bind'] as const)('(i) keeps two live roots independent with %s', async (mode) => {
    const ajvValidatorPlugin = await loadPlugin(mode, directGuardCompile);
    const first = root('first');
    const second = root('second');
    const firstValidate = ajvValidatorPlugin.compile(first);
    const secondValidate = ajvValidatorPlugin.compile(second);
    const firstGuard = ajvValidatorPlugin.compileGuard(first, '/if');
    const secondGuard = ajvValidatorPlugin.compileGuard(second, '/if');
    const value = { kind: 'first' };
    const directFirst = new Ajv({ strictSchema: false }).compile(first);
    const directSecond = new Ajv({ strictSchema: false }).compile(second);
    expect((await firstValidate(value)) === null).toBe(directFirst(value));
    expect((await secondValidate(value)) === null).toBe(directSecond(value));
    expect(firstGuard(value)).toBe(true);
    expect(secondGuard(value)).toBe(false);
    ajvValidatorPlugin.release(first);
    ajvValidatorPlugin.release(second);
  });

  it.each(['default', 'bind'] as const)('(ii) isolates nested IDs and absolute self references with %s', async (mode) => {
    const ajvValidatorPlugin = await loadPlugin(mode, directGuardCompile);
    const makeRoot = (type: string): JSONSchema => JSON.parse(JSON.stringify({
      $id: 'https://example.test/shared-self',
      $defs: { value: { $id: 'https://example.test/shared-inner', type } },
      if: { $ref: 'https://example.test/shared-self#/$defs/value' },
      then: { const: 'accepted' },
    })) as JSONSchema;
    const first = makeRoot('string');
    const second = makeRoot('number');
    const firstValidate = ajvValidatorPlugin.compile(first);
    const secondValidate = ajvValidatorPlugin.compile(second);
    for (const [schema, validate, value] of [[first, firstValidate, 'wrong'], [second, secondValidate, 3]] as const) {
      const direct = new Ajv({ strictSchema: false }).compile(schema);
      expect((await validate(value)) === null).toBe(direct(value));
      expect(ajvValidatorPlugin.compileGuard(schema, '/if')(value)).toBe(direct(value) === false);
    }
    ajvValidatorPlugin.release(first);
    ajvValidatorPlugin.release(second);
  });

  it.each(['default', 'bind'] as const)('(iii) retains the old root until release during reset with %s', async (mode) => {
    const ajvValidatorPlugin = await loadPlugin(mode, directGuardCompile);
    const oldRoot = root('old');
    const newRoot = root('new');
    const oldValidate = ajvValidatorPlugin.compile(oldRoot);
    const newValidate = ajvValidatorPlugin.compile(newRoot);
    const directOld = new Ajv({ strictSchema: false }).compile(oldRoot);
    const directNew = new Ajv({ strictSchema: false }).compile(newRoot);
    expect((await oldValidate({ kind: 'old' })) === null).toBe(directOld({ kind: 'old' }));
    expect((await newValidate({ kind: 'old' })) === null).toBe(directNew({ kind: 'old' }));
    ajvValidatorPlugin.release(oldRoot);
    expect((await newValidate({ kind: 'new' })) === null).toBe(directNew({ kind: 'new' }));
    ajvValidatorPlugin.release(newRoot);
  });

  it.each(['default', 'bind'] as const)('(iv) allows a surviving root to compile a late guard with %s', async (mode) => {
    const ajvValidatorPlugin = await loadPlugin(mode, directGuardCompile);
    const removed = root('removed');
    const surviving = root('surviving');
    ajvValidatorPlugin.compile(removed);
    ajvValidatorPlugin.compile(surviving);
    ajvValidatorPlugin.release(removed);
    const value = { kind: 'surviving' };
    const direct = new Ajv({ strictSchema: false }).compile(surviving);
    expect(ajvValidatorPlugin.compileGuard(surviving, '/if')(value)).toBe(!direct(value));
    ajvValidatorPlugin.release(surviving);
  });
});

});
