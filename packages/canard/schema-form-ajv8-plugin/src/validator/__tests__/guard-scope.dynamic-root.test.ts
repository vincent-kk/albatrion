import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import { loadDynamicScopePlugin } from './utils/loadDynamicScopePlugin';
import { observeIfBranches } from './utils/observeIfBranches';

const dialects = [
  {
    dialect: '2020',
    Oracle: Ajv2020,
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    anchor: { $dynamicAnchor: 'node' },
    reference: { $dynamicRef: '#node' },
  },
  {
    dialect: '2019',
    Oracle: Ajv2019,
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    anchor: { $recursiveAnchor: true },
    reference: { $recursiveRef: '#' },
  },
] as const;

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

describe.each(dialects)('VALIDATE-047 root dynamic scope, $dialect', ({ dialect, Oracle, $schema, anchor, reference }) => {
  describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
    it.each(['default', 'bind'] as const)('T1 keeps a root /if guard independent of other root assertions with %s', async (mode) => {
      const plugin = await loadDynamicScopePlugin(dialect, mode, directGuardCompile);
      const root = copyOf({
        $schema,
        $id: `https://example.test/ajv8/${dialect}/root-assertions`,
        ...anchor,
        type: 'object',
        required: ['x'],
        $defs: { flag: { required: ['flag'] } },
        if: { $ref: '#/$defs/flag' },
        ...branches,
      });
      const guard = plugin.compileGuard(root, '/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of [{}, { flag: true }, { x: 1 }, { x: 1, flag: true }]) {
        const observed = observeIfBranches(validate, (marker) => ({ ...value, x: 1, ...marker }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it.each(['default', 'bind'] as const)('T2 resolves the root dynamic scope from a nested if with %s', async (mode) => {
      const plugin = await loadDynamicScopePlugin(dialect, mode, directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/nested-if`,
        ...anchor,
        type: 'object',
        properties: { kind: { type: 'string', const: 'yes' }, item: { $ref: '#/$defs/branch' } },
        required: ['kind'],
        $defs: { branch: { if: { properties: { next: reference }, required: ['next'] }, ...branches } },
      });
      const guard = plugin.compileGuard(root, '/$defs/branch/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of [{ next: { kind: 'yes' } }, { next: { kind: 'no' } }]) {
        const observed = observeIfBranches(validate, (marker) => ({ kind: 'yes', item: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it.each(['default', 'bind'] as const)('T9 refuses an asynchronous root anchor for a root /if guard with %s', async (mode) => {
      const plugin = await loadDynamicScopePlugin(dialect, mode, directGuardCompile);
      const root = copyOf({
        $async: true,
        $id: `https://example.test/ajv8/${dialect}/async-root-if`,
        ...anchor,
        type: 'object',
        if: { properties: { next: reference }, required: ['next'] },
        ...branches,
      });
      expect(() => plugin.compileGuard(root, '/if')).toThrow(/async schema/);
      plugin.release(root);
    });

    it.each(['default', 'bind'] as const)('T9 refuses an asynchronous root anchor for a nested guard with %s', async (mode) => {
      const plugin = await loadDynamicScopePlugin(dialect, mode, directGuardCompile);
      const root = copyOf({
        $async: true,
        $id: `https://example.test/ajv8/${dialect}/async-root-nested`,
        ...anchor,
        type: 'object',
        properties: { item: { $ref: '#/$defs/branch' } },
        $defs: { branch: { if: { properties: { next: reference }, required: ['next'] }, ...branches } },
      });
      expect(() => plugin.compileGuard(root, '/$defs/branch/if')).toThrow(/async schema/);
      plugin.release(root);
    });
  });
});
