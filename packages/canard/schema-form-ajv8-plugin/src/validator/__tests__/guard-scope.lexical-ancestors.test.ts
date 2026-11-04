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
    outerAnchor: { $dynamicAnchor: 'outer' },
    anchor: { $dynamicAnchor: 'node' },
    reference: { $dynamicRef: '#node' },
    unboundReference: { $dynamicRef: '#missing' },
    hostBinds: true,
  },
  {
    dialect: '2019',
    Oracle: Ajv2019,
    outerAnchor: { $recursiveAnchor: false },
    anchor: { $recursiveAnchor: true },
    reference: { $recursiveRef: '#' },
    unboundReference: { $recursiveRef: '#' },
    hostBinds: false,
  },
] as const;

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const hostValues = [
  { ok: true, next: { ok: true, rejected: true } },
  { ok: true, next: { rejected: true } },
] as const;

const dynamicCondition = { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] } as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

describe.each(dialects)('VALIDATE-047 lexical ancestor chain, $dialect', ({ dialect, Oracle, outerAnchor, anchor, reference, unboundReference, hostBinds }) => {
  const condition = { properties: { next: reference }, required: ['next'] };

  describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
    it.each(['default', 'bind'] as const)('T8 (a) binds the anchor of a nested resource on the pointer path with %s', async (mode) => {
      const plugin = await loadDynamicScopePlugin(dialect, mode, directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/chain/root`,
        ...outerAnchor,
        $ref: 'mid/',
        $defs: {
          mid: {
            $id: 'mid/',
            $ref: 'leaf',
            $defs: { leaf: { $id: 'leaf', ...anchor, type: 'object', required: ['ok'], if: condition, ...branches } },
          },
        },
      });
      const guard = plugin.compileGuard(root, '/$defs/mid/$defs/leaf/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of hostValues) {
        const observed = observeIfBranches(validate, (marker) => ({ ...value, ...marker }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it.each(['default', 'bind'] as const)(`T8 (b) ${hostBinds ? 'binds the anchor of an ancestor without $id' : 'refuses $recursiveAnchor below a resource root (L12)'} with %s`, async (mode) => {
      const plugin = await loadDynamicScopePlugin(dialect, mode, directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/host-anchor`,
        type: 'object',
        properties: { host: { ...anchor, type: 'object', required: ['ok'], if: condition, ...branches } },
      });
      if (!hostBinds) {
        expect(() => plugin.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
        plugin.release(root);
        return;
      }
      const guard = plugin.compileGuard(root, '/properties/host/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of hostValues) {
        const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it('binds an off-path $defs declarer of the root resource as the specification does', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const id = `https://example.test/ajv8/${dialect}/off-path`;
      const root = copyOf({
        $id: id,
        type: 'object',
        properties: { a: { if: dynamicCondition, ...branches } },
        $defs: { tree: { $dynamicAnchor: 'node', type: 'object', required: ['ok'] } },
      });
      const guard = plugin.compileGuard(root, '/properties/a/if');
      const oracle = new Oracle({ strictSchema: false });
      oracle.compile(root);
      const tree = oracle.getSchema(`${id}#/$defs/tree`);
      expect(tree).toBeTypeOf('function');
      for (const value of [{ next: { ok: true } }, { next: {} }]) {
        const expected = tree?.(value.next) === true;
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: expected });
      }
      plugin.release(root);
    });

    it('binds the anchor of a wrapper without $id outside the pointer path', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/plain-wrapper`,
        $ref: '#/$defs/wrapper',
        $defs: {
          wrapper: { $dynamicAnchor: 'node', $ref: '#/$defs/leaf' },
          leaf: { type: 'object', required: ['ok'], if: dynamicCondition, ...branches },
        },
      });
      const guard = plugin.compileGuard(root, '/$defs/leaf/if');
      const validate = new Oracle({ strictSchema: false }).compile(root);
      for (const value of hostValues) {
        const observed = observeIfBranches(validate, (marker) => ({ ...value, ...marker }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      plugin.release(root);
    });

    it('refuses an inline reference whose name nothing declares (L12 for $recursiveRef)', async () => {
      const plugin = await loadDynamicScopePlugin(dialect, 'default', directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv8/${dialect}/unbound`,
        type: 'object',
        properties: { a: { if: { properties: { next: unboundReference }, required: ['next'] }, ...branches } },
      });
      expect(() => plugin.compileGuard(root, '/properties/a/if')).toThrow(/is not bound/);
      plugin.release(root);
    });
  });

  it('L8′ refuses an off-chain $id wrapper that binds the anchor first', async () => {
    const plugin = await loadDynamicScopePlugin(dialect, 'default', true);
    const root = copyOf({
      $id: `https://example.test/ajv8/${dialect}/l8/root`,
      $ref: 'wrapper',
      $defs: {
        wrapper: { $id: 'wrapper', ...anchor, $ref: 'leaf' },
        leaf: { $id: 'leaf', type: 'object', required: ['ok'], if: condition, ...branches },
      },
    });
    expect(() => plugin.compileGuard(root, '/$defs/leaf/if')).toThrow(/is not bound/);
    plugin.release(root);
  });

  it('L9 observes an inline anchor whose relative reference resolves against two base URIs', async () => {
    const plugin = await loadDynamicScopePlugin(dialect, 'default', true);
    const root = copyOf({
      $id: `https://example.test/ajv8/${dialect}/l9/root`,
      $ref: 'inner/',
      $defs: {
        rootRule: { $id: 'rule', required: ['rootOnly'] },
        inner: {
          $id: 'inner/',
          type: 'object',
          properties: { host: { ...anchor, $ref: 'rule', if: condition, ...branches } },
          $defs: { rule: { $id: 'rule', required: ['innerOnly'] } },
        },
      },
    });
    const validate = new Oracle({ strictSchema: false }).compile(root);
    let guard: ((value: unknown) => boolean) | string;
    try {
      guard = plugin.compileGuard(root, '/$defs/inner/properties/host/if');
    } catch (error) {
      guard = `compile rejected (${(error as Error).message})`;
    }
    for (const value of [
      { innerOnly: true, next: { innerOnly: true, rejected: true } },
      { innerOnly: true, next: { innerOnly: true, rootOnly: true, rejected: true } },
    ]) {
      const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
      const verdict = typeof guard === 'string' ? guard : guard(value);
      console.info(`| L9 | ajv8 ${dialect} | ${JSON.stringify(value)} | whole ${observed.accepted}/${observed.rejected} | guard ${verdict} |`);
    }
    plugin.release(root);
  });
});
