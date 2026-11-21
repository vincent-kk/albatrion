import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as create2019Validator } from '../2019/index';
import { createValidator as create2020Validator } from '../2020/index';
import { createValidator } from '../default/index';

describe.each([
  [
    'draft-07',
    () => new Ajv({ allErrors: true, strict: false }),
    createValidator,
  ],
  [
    '2019-09',
    () => new Ajv2019({ allErrors: true, strict: false }),
    create2019Validator,
  ],
  [
    '2020-12',
    () => new Ajv2020({ allErrors: true, strict: false }),
    create2020Validator,
  ],
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
      ajv.addKeyword({
        keyword: 'remoteOk',
        async: true,
        validate: async (_schema: boolean, value: string) => value !== 'bad',
      });
      ajv.addKeyword({
        keyword: 'available',
        macro: () => ({ remoteOk: true }),
      });
      ajv.addKeyword({ keyword: 'nested', macro: () => ({ available: true }) });
      ajv.addKeyword({
        keyword: 'lookup',
        macro: () => ({ $ref: 'app-check' }),
      });
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
