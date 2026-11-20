import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

describe.each([
  ['draft-07', () => new Ajv({ allErrors: true }), createValidator],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each([
    ['pointer', false, true, ['remoteOk']],
    ['pointer', true, false, ['remoteOk']],
    ['format', true, true, ['remote-format']],
    ['macro', false, true, ['remoteOk', 'available']],
    ['nested macro', true, false, ['remoteOk', 'available', 'nested']],
    ['macro reference', false, false, ['minLength', 'lookup']],
  ] as const)(
    'compiles %s with id=%s and guard first=%s',
    async (mode, withId, guardFirst, rejected) => {
      const ajv = instance();
      ajv.addKeyword('remoteOk', {
        async: true,
        validate: async (_schema: boolean, value: string) => value !== 'bad',
      });
      ajv.addKeyword('available', { macro: () => ({ remoteOk: true }) });
      ajv.addKeyword('nested', { macro: () => ({ available: true }) });
      ajv.addKeyword('lookup', { macro: () => ({ $ref: 'app-check' }) });
      ajv.addSchema({ type: 'string', minLength: 4 }, 'app-check');
      ajv.addFormat('remote-format', {
        async: true,
        validate: async (value: string) => value !== 'bad',
      });
      const root: JSONSchema = {
        ...(withId ? { $id: 'https://app.invalid/form.json' } : {}),
        type: 'object',
        components: {
          name: { type: 'string', remoteOk: true },
          formatted: { type: 'string', format: 'remote-format' },
        },
        properties: {
          name:
            mode === 'pointer'
              ? { $ref: '#/components/name' }
              : mode === 'format'
                ? { $ref: '#/components/formatted' }
                : mode === 'nested macro'
                  ? { nested: true }
                  : mode === 'macro reference'
                    ? { lookup: true }
                    : { available: true },
        },
        if: { required: ['trigger'] },
        then: { required: ['extra'] },
      };
      const adapter = adapterFor(ajv);
      const checkGuard = () => {
        const guard = adapter.compileGuard(root, '/if');
        expect(guard({ trigger: true })).toBe(true);
        expect(guard({})).toBe(false);
      };
      if (guardFirst) checkGuard();
      const validate = adapter.compile(root);
      expect(
        (await validate({ name: 'bad' }))?.map((issue) =>
          issue.keyword === 'format' ? 'remote-format' : issue.keyword,
        ),
      ).toEqual(rejected);
      expect(await validate({ name: 'good' })).toBeNull();
      if (!guardFirst) checkGuard();
    },
  );
});
