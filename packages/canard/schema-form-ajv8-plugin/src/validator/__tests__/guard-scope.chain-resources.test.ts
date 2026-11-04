import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import { loadDynamicScopePlugin } from './utils/loadDynamicScopePlugin';
import { observeIfBranches } from './utils/observeIfBranches';

const dialects = [
  { dialect: '2020', Oracle: Ajv2020 },
  { dialect: '2019', Oracle: Ajv2019 },
] as const;

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const dynamicCondition = { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] } as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

describe.each(dialects)('VALIDATE-047 chain resources, $dialect', ({ dialect, Oracle }) => {
  describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
    it('binds the outermost chain resource that declares the name, even off the pointer path', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const id = `https://example.test/ajv8/${dialect}/outermost`;
      const root = copyOf({
        $id: id,
        type: 'object',
        properties: { item: { $ref: '#/$defs/inner' } },
        $defs: {
          outer: { $dynamicAnchor: 'node', type: 'object', required: ['outerOnly'] },
          inner: { $id: 'inner', $dynamicAnchor: 'node', type: 'object', required: ['ok'], if: dynamicCondition, ...branches },
        },
      });
      const guard = plugin.compileGuard(root, '/$defs/inner/if');
      const oracle = new Oracle({ strictSchema: false });
      oracle.compile(root);
      const outer = oracle.getSchema(`${id}#/$defs/outer`);
      expect(outer).toBeTypeOf('function');
      for (const value of [{ next: { outerOnly: true } }, { next: { ok: true } }]) {
        const expected = outer?.(value.next) === true;
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: expected });
      }
      plugin.release(root);
    });

    it('binds a declaration on an ancestor of the reference inside the if', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/self-binding`,
        type: 'object',
        properties: {
          host: {
            if: { allOf: [{ $id: 'local', $dynamicAnchor: 'node', type: 'object', required: ['ok'], properties: { next: { $dynamicRef: '#node' } } }] },
            ...branches,
          },
        },
      });
      const guard = plugin.compileGuard(root, '/properties/host/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of [{ ok: true, next: { ok: true } }, { ok: true, next: {} }]) {
        const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it('refuses a declaration on a sibling property of the reference (F29)', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/sibling`,
        type: 'object',
        properties: {
          host: {
            if: { properties: { binder: { $dynamicAnchor: 'node' }, next: { $dynamicRef: '#node' } } },
            ...branches,
          },
        },
      });
      expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      plugin.release(root);
    });

    it('refuses a declaration that sits only under $defs inside the if (F28)', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/defs-only`,
        type: 'object',
        properties: {
          host: {
            if: { allOf: [{ $id: 'local', $defs: { target: { $dynamicAnchor: 'node' } }, properties: { next: { $dynamicRef: '#node' } } }] },
            ...branches,
          },
        },
      });
      expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      plugin.release(root);
    });

    it('refuses a $recursiveRef that shares its object with a bound $dynamicRef', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/mixed-reference`,
        $dynamicAnchor: 'node',
        type: 'object',
        properties: {
          host: { if: { $dynamicRef: '#node', $recursiveRef: '#' }, ...branches },
        },
      });
      expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/dynamic reference # is not bound/);
      plugin.release(root);
    });

    it('reads a $dynamicRef inside const as data, not as a reference', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/const-data`,
        type: 'object',
        properties: {
          host: {
            if: { properties: { v: { const: { $dynamicRef: '#missing' } } }, required: ['v'] },
            ...branches,
          },
        },
      });
      const guard = plugin.compileGuard(root, '/properties/host/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of [{ v: { $dynamicRef: '#missing' } }, { v: 1 }]) {
        const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it('does not collect a $dynamicAnchor inside default as a declaration', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/default-data`,
        type: 'object',
        default: { $dynamicAnchor: 'node' },
        properties: { host: { if: dynamicCondition, ...branches } },
      });
      expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      plugin.release(root);
    });
  });
});
