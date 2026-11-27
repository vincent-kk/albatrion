import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { loadDynamicScopePlugin } from './utils/loadDynamicScopePlugin';
import { observeIfBranches } from './utils/observeIfBranches';

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

describe.each([true, false])('VALIDATE-047 guard reference forms, directGuardCompile=%s', (directGuardCompile) => {
  it('keeps $recursiveRef an ignored unknown keyword on the draft-07 entry point', async () => {
    vi.resetModules();
    const { ajvValidatorPlugin } = await import('../../default/validatorPlugin');
    ajvValidatorPlugin.configure({ directGuardCompile });
    const root = copyOf({
      type: 'object',
      properties: {
        host: { if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] }, ...branches },
      },
    });
    const guard = ajvValidatorPlugin.compileGuard(root, '/properties/host/if');
    const validate = new Ajv({ strictSchema: false }).compile(root);
    for (const value of [{ next: 1 }, {}]) {
      const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
      expect(observed.accepted).not.toBe(observed.rejected);
      expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
    }
    ajvValidatorPlugin.release(root);
  });

  it('refuses a $recursiveRef whose fragment is a JSON Pointer on 2019', async () => {
    const plugin = await loadDynamicScopePlugin('2019', 'default', directGuardCompile);
    const root = copyOf({
      $id: 'https://example.test/ajv8/2019/recursive-pointer-fragment',
      $recursiveAnchor: true,
      type: 'object',
      $defs: { target: { type: 'object' } },
      properties: {
        host: { if: { properties: { next: { $recursiveRef: '#/$defs/target' } }, required: ['next'] }, ...branches },
      },
    });
    expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/#\/\$defs\/target is not bound: a JSON Pointer fragment/);
    plugin.release(root);
  });

  it.each(['2020', '2019'] as const)('refuses a $dynamicRef whose fragment is a JSON Pointer on %s', async (dialect) => {
    const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
    const root = copyOf({
      $id: `https://example.test/ajv8/${dialect}/pointer-fragment`,
      $dynamicAnchor: 'node',
      type: 'object',
      $defs: { target: { type: 'object' } },
      properties: {
        host: { if: { properties: { next: { $dynamicRef: '#/$defs/target' } }, required: ['next'] }, ...branches },
      },
    });
    expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/#\/\$defs\/target is not bound: a JSON Pointer fragment/);
    plugin.release(root);
  });
});
