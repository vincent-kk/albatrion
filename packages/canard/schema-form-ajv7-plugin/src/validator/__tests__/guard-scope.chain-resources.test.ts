import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import { afterEach, describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';
import { loadDynamicScopeValidator } from './utils/loadDynamicScopeValidator';
import { observeIfBranches } from './utils/observeIfBranches';

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const dynamicCondition = { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] } as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

const oracle = () => new Ajv2019({ allErrors: true, strict: false, validateFormats: false });

describe('VALIDATE-047 chain resources, Ajv 2019 binding', () => {
  afterEach(() => { ajvValidatorPlugin.configure({ directGuardCompile: true }); });

  describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
    it('binds the outermost chain resource that declares the name, even off the pointer path', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const id = 'https://example.test/ajv7/outermost';
      const root = copyOf({
        $id: id,
        type: 'object',
        properties: { item: { $ref: '#/$defs/inner' } },
        $defs: {
          outer: { $dynamicAnchor: 'node', type: 'object', required: ['outerOnly'] },
          inner: { $id: 'inner', $dynamicAnchor: 'node', type: 'object', required: ['ok'], if: dynamicCondition, ...branches },
        },
      });
      const guard = validator.compileGuard(root, '/$defs/inner/if');
      const instance = oracle();
      instance.compile(root);
      const outer = instance.getSchema(`${id}#/$defs/outer`);
      expect(outer).toBeTypeOf('function');
      for (const value of [{ next: { outerOnly: true } }, { next: { ok: true } }]) {
        const expected = outer?.(value.next) === true;
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: expected });
      }
      validator.release?.(root);
    });

    it('binds a declaration on an ancestor of the reference inside the if', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/self-binding',
        type: 'object',
        properties: {
          host: {
            if: { allOf: [{ $id: 'local', $dynamicAnchor: 'node', type: 'object', required: ['ok'], properties: { next: { $dynamicRef: '#node' } } }] },
            ...branches,
          },
        },
      });
      const guard = validator.compileGuard(root, '/properties/host/if');
      const validate = oracle().compile(root);
      for (const value of [{ ok: true, next: { ok: true } }, { ok: true, next: {} }]) {
        const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      validator.release?.(root);
    });

    it('refuses a declaration on a sibling property of the reference (F29)', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/sibling',
        type: 'object',
        properties: {
          host: {
            if: { properties: { binder: { $dynamicAnchor: 'node' }, next: { $dynamicRef: '#node' } } },
            ...branches,
          },
        },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      validator.release?.(root);
    });

    it('refuses a declaration that sits only under $defs inside the if (F28)', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/defs-only',
        type: 'object',
        properties: {
          host: {
            if: { allOf: [{ $id: 'local', $defs: { target: { $dynamicAnchor: 'node' } }, properties: { next: { $dynamicRef: '#node' } } }] },
            ...branches,
          },
        },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      validator.release?.(root);
    });

    it('refuses a $recursiveRef that shares its object with a bound $dynamicRef', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/mixed-reference',
        $dynamicAnchor: 'node',
        type: 'object',
        properties: {
          host: { if: { $dynamicRef: '#node', $recursiveRef: '#' }, ...branches },
        },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/dynamic reference # is not bound/);
      validator.release?.(root);
    });

    it('reads a $dynamicRef inside const as data, not as a reference', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/const-data',
        type: 'object',
        properties: {
          host: {
            if: { properties: { v: { const: { $dynamicRef: '#missing' } } }, required: ['v'] },
            ...branches,
          },
        },
      });
      const guard = validator.compileGuard(root, '/properties/host/if');
      const validate = oracle().compile(root);
      for (const value of [{ v: { $dynamicRef: '#missing' } }, { v: 1 }]) {
        const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      validator.release?.(root);
    });

    it('does not collect a $dynamicAnchor inside default as a declaration', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/default-data',
        type: 'object',
        default: { $dynamicAnchor: 'node' },
        properties: { host: { if: dynamicCondition, ...branches } },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      validator.release?.(root);
    });
  });
});
