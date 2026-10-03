import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
  beforeEach(() => { ajvValidatorPlugin.configure({ directGuardCompile }); });
  afterEach(async () => {
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    (await import('../validatorPlugin')).ajvValidatorPlugin.configure({ directGuardCompile: true });
  });
describe('VALIDATE-033 VALIDATE-047 guard scope', () => {
  it('uses the bound format profile with allErrors disabled for guards', () => {
    const instance = new Ajv({ allErrors: true, strict: false, validateFormats: true });
    instance.addFormat('onlyX', /^x$/);
    ajvValidatorPlugin.bind?.(instance);
    const root = { type: 'object', properties: { value: { type: 'string', format: 'onlyX' } } } as const;
    const guard = ajvValidatorPlugin.compileGuard(root, '/properties/value');
    expect(guard('x')).toBe(true);
    expect(guard('z')).toBe(false);
    expect(instance.opts.allErrors).toBe(true);
  });

  it('case (i): resolves a relative reference inside an inner $id', () => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false, validateFormats: false }));
    const root = {
      $id: 'https://example.test/ajv7/guard.json',
      type: 'object',
      definitions: { branch: {
        $id: 'nested/',
        definitions: { eligible: { properties: { kind: { const: 'yes' } }, required: ['kind'] } },
        if: { $ref: '#/definitions/eligible' },
        then: { required: ['accepted'] },
        else: { required: ['rejected'] },
      } },
      properties: { item: { $ref: 'nested/' } },
    } as const;
    const direct = new Ajv({ allErrors: true, strict: false, validateFormats: false }).compile(root);
    const guard = ajvValidatorPlugin.compileGuard(root, '/definitions/branch/if');
    for (const [item, expected] of [
      [{ kind: 'yes', accepted: true }, true],
      [{ kind: 'no', rejected: true }, false],
    ] as const) {
      expect(guard(item)).toBe(expected);
      expect(direct({ item })).toBe(true);
    }
  });

  it('case (ii): follows a dynamic anchor from a nested if', () => {
    const instance = new Ajv2019({ allErrors: true, strict: false, validateFormats: false });
    ajvValidatorPlugin.bind?.(instance);
    const root = {
      $id: 'https://example.test/ajv7/dynamic.json',
      $dynamicAnchor: 'node',
      type: 'object',
      properties: { kind: { type: 'string', const: 'yes' }, item: { $ref: '#/$defs/branch' } },
      required: ['kind'],
      $defs: { branch: {
        if: { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] },
        then: { required: ['accepted'] },
        else: { required: ['rejected'] },
      } },
    } as const;
    const direct = new Ajv2019({ allErrors: true, strict: false, validateFormats: false }).compile(root);
    const guard = ajvValidatorPlugin.compileGuard(JSON.parse(JSON.stringify(root)) as JSONSchema, '/$defs/branch/if');
    for (const item of [{ next: { kind: 'yes' } }, { next: { kind: 'no' } }]) {
      const accepted = direct({ kind: 'yes', item: { ...item, accepted: true } });
      const rejected = direct({ kind: 'yes', item: { ...item, rejected: true } });
      expect(accepted).not.toBe(rejected);
      expect(guard(item)).toBe(accepted);
    }
  });

  it('case (iii): follows a recursive reference from a nested if', () => {
    ajvValidatorPlugin.bind?.(new Ajv2019({ allErrors: true, strict: false, validateFormats: false }));
    const root = {
      $id: 'https://example.test/ajv7/recursive.json',
      $recursiveAnchor: true,
      type: 'object',
      properties: { kind: { type: 'string', const: 'yes' }, item: { $ref: '#/$defs/branch' } },
      required: ['kind'],
      $defs: { branch: {
        if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
        then: { required: ['accepted'] },
        else: { required: ['rejected'] },
      } },
    } as const;
    const direct = new Ajv2019({ allErrors: true, strict: false, validateFormats: false }).compile(root);
    const guard = ajvValidatorPlugin.compileGuard(JSON.parse(JSON.stringify(root)) as JSONSchema, '/$defs/branch/if');
    for (const item of [{ next: { kind: 'yes' } }, { next: { kind: 'no' } }]) {
      const accepted = direct({ kind: 'yes', item: { ...item, accepted: true } });
      const rejected = direct({ kind: 'yes', item: { ...item, rejected: true } });
      expect(accepted).not.toBe(rejected);
      expect(guard(item)).toBe(accepted);
    }
  });

  it('case (iv): records one location used from two dynamic scopes as unsupported', () => {
    ajvValidatorPlugin.bind?.(new Ajv2019({ allErrors: true, strict: false, validateFormats: false }));
    const id = 'https://example.test/ajv7/two-scopes.json';
    const root = {
      $id: id,
      type: 'object',
      $defs: {
        common: {
          if: { properties: { next: { $dynamicRef: '#node' } }, required: ['next'] },
          then: { required: ['accepted'] },
          else: { required: ['rejected'] },
        },
        left: {
          $id: 'left', $dynamicAnchor: 'node', type: 'object',
          properties: { kind: { type: 'string', const: 'left' }, item: { $ref: `${id}#/$defs/common` } },
          required: ['kind'],
        },
        right: {
          $id: 'right', $dynamicAnchor: 'node', type: 'object',
          properties: { kind: { type: 'string', const: 'right' }, item: { $ref: `${id}#/$defs/common` } },
          required: ['kind'],
        },
      },
      properties: { left: { $ref: '#/$defs/left' }, right: { $ref: '#/$defs/right' } },
    } as const;
    const direct = new Ajv2019({ allErrors: true, strict: false, validateFormats: false }).compile(root);
    const value = { next: { kind: 'left' } };
    const left = direct({ left: { kind: 'left', item: { ...value, accepted: true } } });
    const right = direct({ right: { kind: 'right', item: { ...value, accepted: true } } });
    expect(left).not.toBe(right);
    const guard = ajvValidatorPlugin.compileGuard(JSON.parse(JSON.stringify(root)) as JSONSchema, '/$defs/common/if');
    const verdict = guard(value);
    expect(verdict === left && verdict === right).toBe(false);
  });
});

});
