import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';
import { ajvValidatorPlugin as pluginDraft07 } from '../../default/validatorPlugin';

describe.each([
  { dialect: 'draft-07', plugin: pluginDraft07, Constructor: Ajv },
  { dialect: '2019-09', plugin: plugin2019, Constructor: Ajv2019 },
  { dialect: '2020-12', plugin: plugin2020, Constructor: Ajv2020 },
])(
  'VALIDATE-017 guard compilation before whole validation ($dialect)',
  ({ dialect, plugin, Constructor }) => {
    beforeEach(() => {
      plugin.bind(
        new Constructor({ allErrors: true, strict: false, validateFormats: false }),
      );
      plugin.configure({ directGuardCompile: true });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('G-PLUGIN-01 compiles a self-contained guard first', async () => {
      const copy: JSONSchema = {
        $id: `https://example.test/ajv8/${dialect}/guard-before-compile/direct`,
        type: 'string',
        if: { type: 'string', minLength: 3 },
        then: { pattern: '^yes' },
      };
      try {
        const guard = plugin.compileGuard(copy, '/if');
        expect(guard('yes')).toBe(true);
        expect(guard('nope')).toBe(true);
        expect(guard('x')).toBe(false);
        expect(guard(2)).toBe(false);

        const validate = plugin.compile(copy);
        expect(await validate('yes')).toBeNull();
        expect(await validate('x')).toBeNull();
        expect(await validate('nope')).toEqual(
          expect.arrayContaining([expect.objectContaining({ keyword: 'pattern' })]),
        );
        expect(guard('yes')).toBe(true);
        expect(guard('x')).toBe(false);
      } finally {
        plugin.release(copy);
      }
    });

    it('G-PLUGIN-02 resolves root refs before whole compile', async () => {
      const copy: JSONSchema = {
        $id: `https://example.test/ajv8/${dialect}/guard-before-compile/ref`,
        type: 'string',
        definitions: { eligible: { type: 'string', minLength: 3 } },
        if: { $ref: '#/definitions/eligible' },
        then: { pattern: '^yes' },
      };
      try {
        const guard = plugin.compileGuard(copy, '/if');
        expect(guard('yes')).toBe(true);
        expect(guard('nope')).toBe(true);
        expect(guard('x')).toBe(false);
        expect(guard(2)).toBe(false);

        const validate = plugin.compile(copy);
        expect(await validate('yes')).toBeNull();
        expect(await validate('x')).toBeNull();
        expect(await validate('nope')).toEqual(
          expect.arrayContaining([expect.objectContaining({ keyword: 'pattern' })]),
        );
        expect(guard('yes')).toBe(true);
        expect(guard('x')).toBe(false);
      } finally {
        plugin.release(copy);
      }
    });

    it('G-PLUGIN-03 release is a no-op before whole compile', async () => {
      const instance = new Constructor({
        allErrors: true,
        strict: false,
        validateFormats: false,
      });
      plugin.bind(instance);
      const add = vi.spyOn(instance, 'addSchema');
      const remove = vi.spyOn(instance, 'removeSchema');
      const compile = vi.spyOn(instance, 'compile');
      const copy: JSONSchema = {
        $id: `https://example.test/ajv8/${dialect}/guard-before-compile/release`,
        type: 'string',
        minLength: 3,
      };
      try {
        expect(() => plugin.release(copy)).not.toThrow();
        expect(add).not.toHaveBeenCalled();
        expect(remove).not.toHaveBeenCalled();
        expect(compile).not.toHaveBeenCalled();

        const validate = plugin.compile(copy);
        expect(await validate('yes')).toBeNull();
        expect(await validate('x')).toEqual(
          expect.arrayContaining([expect.objectContaining({ keyword: 'minLength' })]),
        );
      } finally {
        plugin.release(copy);
      }
    });
  },
);
