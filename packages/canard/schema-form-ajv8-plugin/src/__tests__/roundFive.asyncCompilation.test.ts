import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { expect, it } from 'vitest';

import * as draft2019 from '../2019/index';
import * as draft2020 from '../2020/index';
import * as entry from '../default/index';

const profiles = [
  {
    name: 'default',
    module: entry,
    instance: () => new Ajv({ allErrors: true, strict: false }),
  },
  {
    name: '2019',
    module: draft2019,
    instance: () => new Ajv2019({ allErrors: true, strict: false }),
  },
  {
    name: '2020',
    module: draft2020,
    instance: () => new Ajv2020({ allErrors: true, strict: false }),
  },
];

it('round-5 class 47: asynchronous meaning is independent of identifiers, references, entry and compile count', async () => {
  let sequence = 0;
  for (const profile of profiles) {
    for (const extension of ['keyword', 'format', 'both', 'neither']) {
      for (const named of [false, true])
        for (const reference of [false, true]) {
          for (const declared of [false, true])
            for (const publicEntry of ['factory', 'instance', 'bound']) {
              const instance = profile.instance();
              instance.addKeyword({
                keyword: 'available',
                async: true,
                type: 'string',
                validate: async () => false,
              });
              instance.addFormat('available', {
                async: true,
                validate: async () => false,
              });
              const rules = {
                ...(extension === 'keyword' || extension === 'both'
                  ? { available: true }
                  : {}),
                ...(extension === 'format' || extension === 'both'
                  ? { format: 'available' }
                  : {}),
              };
              const schema: JSONSchema = {
                ...(named
                  ? { $id: `https://round-five.invalid/async-${++sequence}` }
                  : {}),
                ...(declared ? { $async: true } : {}),
                type: 'object',
                definitions: { text: { type: 'string' } },
                properties: {
                  name: { type: 'string', minLength: 3, ...rules },
                  ...(reference ? { extra: { $ref: '#/definitions/text' } } : {}),
                },
              };
              const bound = profile.module.plugin.validator;
              if (publicEntry === 'bound') bound.bind(instance);
              const adapter = profile.module.createValidator(instance);
              const compile =
                publicEntry === 'factory'
                  ? profile.module.createValidatorFactory(instance)
                  : publicEntry === 'bound'
                    ? bound.compile
                    : adapter.compile;
              const expected =
                extension === 'neither'
                  ? ['minLength /name']
                  : [
                      ...(extension === 'format' || extension === 'both'
                        ? ['format /name']
                        : []),
                      ...(extension === 'keyword' || extension === 'both'
                        ? ['available /name']
                        : []),
                    ].sort();
              for (const repetition of [1, 2]) {
                const context = JSON.stringify({
                  dialect: profile.name,
                  extension,
                  named,
                  reference,
                  declared,
                  publicEntry,
                  repetition,
                });
                const result = await compile(schema)({
                  name: extension === 'neither' ? 'x' : 'taken',
                });
                expect(
                  result
                    ?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`)
                    .sort(),
                  context,
                ).toEqual(expected);
              }
            }
        }
    }
  }
}, 120000);
