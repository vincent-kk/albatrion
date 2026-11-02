import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('VALIDATE-017 guard compilation before whole validation', () => {
  beforeEach(() => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, format: false }));
    ajvValidatorPlugin.configure({ directGuardCompile: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('G-PLUGIN-01 compiles a self-contained guard first', async () => {
    const copy: JSONSchema = {
      $id: 'https://example.test/ajv6/guard-before-compile/direct',
      type: 'string',
      if: { type: 'string', minLength: 3 },
      then: { pattern: '^yes' },
    };
    try {
      const guard = ajvValidatorPlugin.compileGuard(copy, '/if');
      expect(guard('yes')).toBe(true);
      expect(guard('nope')).toBe(true);
      expect(guard('x')).toBe(false);
      expect(guard(2)).toBe(false);

      const validate = ajvValidatorPlugin.compile(copy);
      expect(await validate('yes')).toBeNull();
      expect(await validate('x')).toBeNull();
      expect(await validate('nope')).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'pattern' })]),
      );
      expect(guard('yes')).toBe(true);
      expect(guard('x')).toBe(false);
    } finally {
      ajvValidatorPlugin.release(copy);
    }
  });

  it('G-PLUGIN-02 resolves root refs before whole compile', async () => {
    const copy: JSONSchema = {
      $id: 'https://example.test/ajv6/guard-before-compile/ref',
      type: 'string',
      definitions: { eligible: { type: 'string', minLength: 3 } },
      if: { $ref: '#/definitions/eligible' },
      then: { pattern: '^yes' },
    };
    try {
      const guard = ajvValidatorPlugin.compileGuard(copy, '/if');
      expect(guard('yes')).toBe(true);
      expect(guard('nope')).toBe(true);
      expect(guard('x')).toBe(false);
      expect(guard(2)).toBe(false);

      const validate = ajvValidatorPlugin.compile(copy);
      expect(await validate('yes')).toBeNull();
      expect(await validate('x')).toBeNull();
      expect(await validate('nope')).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'pattern' })]),
      );
      expect(guard('yes')).toBe(true);
      expect(guard('x')).toBe(false);
    } finally {
      ajvValidatorPlugin.release(copy);
    }
  });

  it('G-PLUGIN-03 release is a no-op before whole compile', async () => {
    const instance = new Ajv({ allErrors: true, format: false });
    ajvValidatorPlugin.bind?.(instance);
    const add = vi.spyOn(instance, 'addSchema');
    const remove = vi.spyOn(instance, 'removeSchema');
    const compile = vi.spyOn(instance, 'compile');
    const copy: JSONSchema = {
      $id: 'https://example.test/ajv6/guard-before-compile/release',
      type: 'string',
      minLength: 3,
    };
    try {
      expect(() => ajvValidatorPlugin.release(copy)).not.toThrow();
      expect(add).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
      expect(compile).not.toHaveBeenCalled();

      const validate = ajvValidatorPlugin.compile(copy);
      expect(await validate('yes')).toBeNull();
      expect(await validate('x')).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'minLength' })]),
      );
    } finally {
      ajvValidatorPlugin.release(copy);
    }
  });
});
