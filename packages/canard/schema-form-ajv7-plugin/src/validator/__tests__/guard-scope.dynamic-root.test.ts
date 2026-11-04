import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import { afterEach, describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';
import { loadDynamicScopeValidator } from './utils/loadDynamicScopeValidator';
import { observeIfBranches } from './utils/observeIfBranches';

const anchor = { $recursiveAnchor: true } as const;
const reference = { $recursiveRef: '#' } as const;

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

describe.each([true, false])('VALIDATE-047 root dynamic scope, Ajv 2019 binding, directGuardCompile=%s', (directGuardCompile) => {
  afterEach(() => { ajvValidatorPlugin.configure({ directGuardCompile: true }); });

  it.each(['plugin', 'instance'] as const)('T1 keeps a root /if guard independent of other root assertions with %s', async (mode) => {
    const validator = loadDynamicScopeValidator(mode, directGuardCompile);
    const root = copyOf({
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      $id: `https://example.test/ajv7/${mode}/root-assertions`,
      ...anchor,
      type: 'object',
      required: ['x'],
      $defs: { flag: { required: ['flag'] } },
      if: { $ref: '#/$defs/flag' },
      ...branches,
    });
    const guard = validator.compileGuard(root, '/if');
    const validate = new Ajv2019({ allErrors: true, strict: false, validateFormats: false }).compile(root);
    for (const value of [{}, { flag: true }, { x: 1 }, { x: 1, flag: true }]) {
      const observed = observeIfBranches(validate, (marker) => ({ ...value, x: 1, ...marker }));
      expect(observed.accepted).not.toBe(observed.rejected);
      expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
    }
    validator.release?.(root);
  });

  it.each(['plugin', 'instance'] as const)('T2 resolves the root dynamic scope from a nested if with %s', async (mode) => {
    const validator = loadDynamicScopeValidator(mode, directGuardCompile);
    const root = copyOf({
      $id: `https://example.test/ajv7/${mode}/nested-if`,
      ...anchor,
      type: 'object',
      properties: { kind: { type: 'string', const: 'yes' }, item: { $ref: '#/$defs/branch' } },
      required: ['kind'],
      $defs: { branch: { if: { properties: { next: reference }, required: ['next'] }, ...branches } },
    });
    const guard = validator.compileGuard(root, '/$defs/branch/if');
    const validate = new Ajv2019({ allErrors: true, strict: false, validateFormats: false }).compile(root);
    for (const value of [{ next: { kind: 'yes' } }, { next: { kind: 'no' } }]) {
      const observed = observeIfBranches(validate, (marker) => ({ kind: 'yes', item: { ...value, ...marker } }));
      expect(observed.accepted).not.toBe(observed.rejected);
      expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
    }
    validator.release?.(root);
  });

  it.each(['plugin', 'instance'] as const)('T9 refuses an asynchronous root anchor for a root /if guard with %s', (mode) => {
    const validator = loadDynamicScopeValidator(mode, directGuardCompile);
    const root = copyOf({
      $async: true,
      $id: `https://example.test/ajv7/${mode}/async-root-if`,
      ...anchor,
      type: 'object',
      if: { properties: { next: reference }, required: ['next'] },
      ...branches,
    });
    expect(() => validator.compileGuard(root, '/if')).toThrow(/async schema/);
    validator.release?.(root);
  });

  it.each(['plugin', 'instance'] as const)('T9 refuses an asynchronous root anchor for a nested guard with %s', (mode) => {
    const validator = loadDynamicScopeValidator(mode, directGuardCompile);
    const root = copyOf({
      $async: true,
      $id: `https://example.test/ajv7/${mode}/async-root-nested`,
      ...anchor,
      type: 'object',
      properties: { item: { $ref: '#/$defs/branch' } },
      $defs: { branch: { if: { properties: { next: reference }, required: ['next'] }, ...branches } },
    });
    expect(() => validator.compileGuard(root, '/$defs/branch/if')).toThrow(/async schema/);
    validator.release?.(root);
  });
});
