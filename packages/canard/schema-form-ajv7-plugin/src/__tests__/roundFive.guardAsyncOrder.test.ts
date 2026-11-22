import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each(['keyword', 'format', 'late-format', 'async-ref', 'declared'])(
  'round-5: root-pointer guard order is independent for %s',
  (trigger) => {
    for (const directGuardCompile of [true, false]) {
      const results: boolean[][] = [];
      for (const compileFirst of [false, true]) {
        const instance = new Ajv({ allErrors: true, strict: false });
        instance.addKeyword({
          keyword: 'asyncCheck',
          async: true,
          validate: async () => true,
        });
        if (trigger !== 'late-format')
          instance.addFormat('asyncFormat', {
            async: true,
            validate: async () => true,
          });
        const adapter = createValidator(instance, { directGuardCompile });
        if (trigger === 'late-format')
          instance.addFormat('asyncFormat', {
            async: true,
            validate: async () => true,
          });
        const extension =
          trigger === 'keyword' || trigger === 'async-ref'
            ? { asyncCheck: true }
            : { format: 'asyncFormat' };
        const root: JSONSchema = {
          $async: true,
          type: 'object',
          definitions: {
            cond: { type: 'string', minLength: 2 },
            asynchronous: { type: 'string', ...extension },
          },
          properties: {
            u:
              trigger === 'async-ref'
                ? { $ref: '#/definitions/asynchronous' }
                : { type: 'string', ...extension },
          },
          if: directGuardCompile
            ? { $ref: '#/definitions/cond' }
            : { type: 'string', minLength: 2 },
        };
        if (compileFirst) adapter.compile(root);
        const guard = adapter.compileGuard(root, '/if');
        results.push([guard('ab'), guard('a')]);
      }
      expect(results[0]).toEqual(results[1]);
      expect(results[0]).toEqual([true, false]);
    }
  },
);

it('a macro in another location affects only the root-pointer guard', () => {
  const ajv = new Ajv({ strict: false });
  ajv.addFormat('async-format', { async: true, validate: async () => true });
  ajv.addKeyword({ keyword: 'asyncMacro', macro: () => ({ format: 'async-format' }) });
  const schema: JSONSchema = {
    if: { type: 'string' },
    properties: { value: { asyncMacro: true } },
  };

  const direct = createValidator(ajv, { directGuardCompile: true });
  expect(direct.compileGuard(schema, '/if')('x')).toBe(true);
  const contextual = createValidator(ajv, { directGuardCompile: false });
  expect(() => contextual.compileGuard(schema, '/if')).toThrow(/async (format|keyword) in sync schema/);
});
