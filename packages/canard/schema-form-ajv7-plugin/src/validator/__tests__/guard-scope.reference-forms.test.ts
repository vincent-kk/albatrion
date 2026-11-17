import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';
import { loadDynamicScopeValidator } from './utils/loadDynamicScopeValidator';
import { observeIfBranches } from './utils/observeIfBranches';

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

describe('VALIDATE-047 guard reference forms', () => {
  afterEach(() => { ajvValidatorPlugin.configure({ directGuardCompile: true }); });

  describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
    it('keeps $recursiveRef an ignored unknown keyword on the draft-07 default instance', async () => {
      vi.resetModules();
      const { ajvValidatorPlugin: plugin } = await import('../validatorPlugin');
      plugin.configure({ directGuardCompile });
      const root = copyOf({
        type: 'object',
        properties: {
          host: { if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] }, ...branches },
        },
      });
      const guard = plugin.compileGuard(root, '/properties/host/if');
      const validate = new Ajv({ allErrors: true, strict: false, validateFormats: false }).compile(root);
      for (const value of [{ next: 1 }, {}]) {
        const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release?.(root);
    });

    it('refuses a $recursiveRef whose fragment is a JSON Pointer', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/recursive-pointer-fragment',
        $recursiveAnchor: true,
        type: 'object',
        $defs: { target: { type: 'object' } },
        properties: {
          host: { if: { properties: { next: { $recursiveRef: '#/$defs/target' } }, required: ['next'] }, ...branches },
        },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/#\/\$defs\/target is not bound: a JSON Pointer fragment/);
      validator.release?.(root);
    });

    it('refuses a $dynamicRef whose fragment is a JSON Pointer', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/pointer-fragment',
        $dynamicAnchor: 'node',
        type: 'object',
        $defs: { target: { type: 'object' } },
        properties: {
          host: { if: { properties: { next: { $dynamicRef: '#/$defs/target' } }, required: ['next'] }, ...branches },
        },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/#\/\$defs\/target is not bound: a JSON Pointer fragment/);
      validator.release?.(root);
    });
  });
});
