import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { expect, it } from 'vitest';

import { createValidator as createValidator2019 } from '../2019/index';
import { createValidator as createValidator2020 } from '../2020/index';
import {
  createValidator,
  createValidatorFactory,
  plugin,
} from '../default/index';

const dialects = [
  ['Draft-07', Ajv, createValidator],
  ['Draft 2019-09', Ajv2019, createValidator2019],
  ['Draft 2020-12', Ajv2020, createValidator2020],
] as const;

const requireFromTest = createRequire(import.meta.url);
const foreignModule = { default: Ajv.ValidationError };
runInNewContext(
  readFileSync(
    requireFromTest.resolve('ajv/dist/runtime/validation_error'),
    'utf8',
  ),
  { exports: foreignModule, Error },
);

for (const [dialect, Constructor, create] of dialects) {
  it(`${dialect} converts only the bound ValidationError class to issues`, async () => {
    expect(foreignModule.default).not.toBe(Constructor.ValidationError);
    const nativeIssue = {
      keyword: 'raise',
      schemaPath: '#/raise',
      instancePath: '',
      params: {},
    };
    const boundError = new Constructor.ValidationError([nativeIssue]);
    const foreignError = new foreignModule.default([nativeIssue]);
    const applicationError = new Error('application error');
    const failures = { boundError, foreignError, applicationError };
    const instance = new Constructor();
    instance.addKeyword({
      keyword: 'raise',
      async: true,
      validate: async (_schema: unknown, data: keyof typeof failures) => {
        throw failures[data];
      },
    });
    const validate = create(instance).compile({
      type: 'string',
      raise: true,
      $async: true,
    });

    await expect(validate('boundError')).resolves.toEqual([
      expect.objectContaining({ keyword: 'raise', dataPath: '' }),
    ]);
    await expect(validate('foreignError')).rejects.toBe(foreignError);
    await expect(validate('applicationError')).rejects.toBe(applicationError);
  });
}

it('round-5 class 47: only native ValidationError becomes issues across sync and async public entries', async () => {
  for (const mode of ['sync', 'async'])
    for (const publicEntry of ['factory', 'instance', 'bound']) {
      for (const kind of ['native', 'array', 'non-array', 'non-Error']) {
        const instance = new Ajv({ allErrors: true, strict: false });
        const issue = {
          keyword: 'explode',
          schemaPath: '#/explode',
          instancePath: '',
          params: {},
          message: 'unavailable',
        };
        const thrown =
          kind === 'native'
            ? new Ajv.ValidationError([issue])
            : kind === 'array'
              ? Object.assign(new Error('execution failed'), {
                  errors: [issue],
                })
              : kind === 'non-array'
                ? Object.assign(new Error('execution failed'), {
                    errors: 'invalid',
                  })
                : { errors: [issue], ajv: true, validation: true };
        const definition = {
          async: mode === 'async',
          validate:
            mode === 'async'
              ? async () => {
                  throw thrown;
                }
              : () => {
                  throw thrown;
                },
        };
        instance.addKeyword({ keyword: 'explode', ...definition });
        const schema: JSONSchema = {
          type: 'string',
          explode: true,
          ...(mode === 'async' ? { $async: true } : {}),
        };
        if (publicEntry === 'bound') plugin.validator.bind(instance);
        const compile =
          publicEntry === 'factory'
            ? createValidatorFactory(instance)
            : publicEntry === 'bound'
              ? plugin.validator.compile
              : createValidator(instance).compile;
        const validate = compile(schema);
        if (kind === 'native') {
          expect(
            (await validate('x'))?.map(({ keyword, dataPath }) => ({
              keyword,
              dataPath,
            })),
          ).toEqual([{ keyword: 'explode', dataPath: '' }]);
        } else {
          await expect(
            validate('x'),
            JSON.stringify({ mode, publicEntry, kind }),
          ).rejects.toBe(thrown);
        }
      }
    }
}, 120000);
