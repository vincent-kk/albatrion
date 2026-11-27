import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator, createValidatorFactory, plugin } from '../index';

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
