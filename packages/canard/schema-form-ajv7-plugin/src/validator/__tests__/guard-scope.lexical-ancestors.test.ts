import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import { afterEach, describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';
import { loadDynamicScopeValidator } from './utils/loadDynamicScopeValidator';
import { observeIfBranches } from './utils/observeIfBranches';

const anchor = { $recursiveAnchor: true } as const;
const condition = { properties: { next: { $recursiveRef: '#' } }, required: ['next'] } as const;
const dynamicCondition = { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] } as const;

const branches = {
  then: { required: ['accepted'] },
  else: { required: ['rejected'] },
} as const;

const hostValues = [
  { ok: true, next: { ok: true, rejected: true } },
  { ok: true, next: { rejected: true } },
] as const;

const copyOf = (schema: object) => JSON.parse(JSON.stringify(schema)) as JSONSchema;

const oracle = () => new Ajv2019({ allErrors: true, strict: false, validateFormats: false });

describe('VALIDATE-047 lexical ancestor chain, Ajv 2019 binding', () => {
  afterEach(() => { ajvValidatorPlugin.configure({ directGuardCompile: true }); });

  describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
    it.each(['plugin', 'instance'] as const)('T8 (a) binds the anchor of a nested resource on the pointer path with %s', (mode) => {
      const validator = loadDynamicScopeValidator(mode, directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv7/${mode}/chain/root`,
        $recursiveAnchor: false,
        $ref: 'mid/',
        $defs: {
          mid: {
            $id: 'mid/',
            $ref: 'leaf',
            $defs: { leaf: { $id: 'leaf', ...anchor, type: 'object', required: ['ok'], if: condition, ...branches } },
          },
        },
      });
      const guard = validator.compileGuard(root, '/$defs/mid/$defs/leaf/if');
      const validate = oracle().compile(root);
      for (const value of hostValues) {
        const observed = observeIfBranches(validate, (marker) => ({ ...value, ...marker }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      validator.release?.(root);
    });

    it.each(['plugin', 'instance'] as const)('T8 (b) refuses $recursiveAnchor below a resource root (L12) with %s', (mode) => {
      const validator = loadDynamicScopeValidator(mode, directGuardCompile);
      const root = copyOf({
        $id: `https://example.test/ajv7/${mode}/host-anchor`,
        type: 'object',
        properties: { host: { ...anchor, type: 'object', required: ['ok'], if: condition, ...branches } },
      });
      expect(() => validator.compileGuard(root, '/properties/host/if')).toThrow(/is not bound/);
      validator.release?.(root);
    });

    it('binds an off-path $defs declarer of the root resource as the specification does', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const id = 'https://example.test/ajv7/off-path';
      const root = copyOf({
        $id: id,
        type: 'object',
        properties: { a: { if: dynamicCondition, ...branches } },
        $defs: { tree: { $dynamicAnchor: 'node', type: 'object', required: ['ok'] } },
      });
      const guard = validator.compileGuard(root, '/properties/a/if');
      const instance = oracle();
      instance.compile(root);
      const tree = instance.getSchema(`${id}#/$defs/tree`);
      expect(tree).toBeTypeOf('function');
      for (const value of [{ next: { ok: true } }, { next: {} }]) {
        const expected = tree?.(value.next) === true;
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: expected });
      }
      validator.release?.(root);
    });

    it('binds the anchor of a wrapper without $id outside the pointer path', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/plain-wrapper',
        $ref: '#/$defs/wrapper',
        $defs: {
          wrapper: { $dynamicAnchor: 'node', $ref: '#/$defs/leaf' },
          leaf: { type: 'object', required: ['ok'], if: dynamicCondition, ...branches },
        },
      });
      const guard = validator.compileGuard(root, '/$defs/leaf/if');
      const validate = oracle().compile(root);
      for (const value of hostValues) {
        const observed = observeIfBranches(validate, (marker) => ({ ...value, ...marker }));
        expect(observed.accepted).not.toBe(observed.rejected);
        expect({ value, verdict: guard(value) }).toEqual({ value, verdict: observed.accepted });
      }
      validator.release?.(root);
    });

    it('refuses an inline $recursiveRef without $recursiveAnchor in the chain (L12)', () => {
      const validator = loadDynamicScopeValidator('instance', directGuardCompile);
      const root = copyOf({
        $id: 'https://example.test/ajv7/unbound',
        type: 'object',
        properties: { a: { if: condition, ...branches } },
      });
      expect(() => validator.compileGuard(root, '/properties/a/if')).toThrow(/is not bound/);
      validator.release?.(root);
    });
  });

  it('L8′ refuses an off-chain $id wrapper that binds the anchor first', () => {
    const validator = loadDynamicScopeValidator('instance', true);
    const root = copyOf({
      $id: 'https://example.test/ajv7/l8/root',
      $ref: 'wrapper',
      $defs: {
        wrapper: { $id: 'wrapper', ...anchor, $ref: 'leaf' },
        leaf: { $id: 'leaf', type: 'object', required: ['ok'], if: condition, ...branches },
      },
    });
    expect(() => validator.compileGuard(root, '/$defs/leaf/if')).toThrow(/is not bound/);
    validator.release?.(root);
  });

  it('L9 observes an inline anchor whose relative reference resolves against two base URIs', () => {
    const validator = loadDynamicScopeValidator('instance', true);
    const root = copyOf({
      $id: 'https://example.test/ajv7/l9/root',
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
    const validate = oracle().compile(root);
    let guard: ((value: unknown) => boolean) | string;
    try {
      guard = validator.compileGuard(root, '/$defs/inner/properties/host/if');
    } catch (error) {
      guard = `compile rejected (${(error as Error).message})`;
    }
    for (const value of [
      { innerOnly: true, next: { innerOnly: true, rejected: true } },
      { innerOnly: true, next: { innerOnly: true, rootOnly: true, rejected: true } },
    ]) {
      const observed = observeIfBranches(validate, (marker) => ({ host: { ...value, ...marker } }));
      const verdict = typeof guard === 'string' ? guard : guard(value);
      console.info(`| L9 | ajv7 2019 | ${JSON.stringify(value)} | whole ${observed.accepted}/${observed.rejected} | guard ${verdict} |`);
    }
    validator.release?.(root);
  });
});
