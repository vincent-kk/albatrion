import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as create2019Validator } from '../2019/index';
import { createValidator as create2020Validator } from '../2020/index';

const registerApplication = (ajv: Ajv2019 | Ajv2020) => {
  ajv.addSchema({
    $id: 'https://app.invalid/modern/defs.json',
    $defs: {
      zip: { $anchor: 'zip', type: 'string', pattern: '^[0-9]{5}$' },
      'a b': { type: 'string', minLength: 3 },
      'c/d': { type: 'integer', minimum: 10 },
    },
  });
};
const id = (tag: string) => `https://verify.invalid/modern/${tag}.json`;

type GuardCase = {
  name: string;
  schema: Parameters<ReturnType<typeof create2019Validator>['compile']>[0];
  guards: { pointer: string; values: unknown[] }[];
  application?: boolean;
};

const rows: GuardCase[] = [
  {
    name: 'defs with $id',
    schema: {
      $id: id('defs'),
      type: 'object',
      $defs: { name: { type: 'string', minLength: 2 } },
      properties: { a: { $ref: '#/$defs/name' }, b: { $ref: '#/$defs/name' } },
      if: { properties: { a: { const: 'zz' } }, required: ['a'] },
      then: { required: ['c'] },
    },
    guards: [{ pointer: '/if', values: [{ a: 'zz' }, { a: 'q' }] }],
  },
  {
    name: 'anchor reference',
    schema: {
      $id: id('anchor'),
      type: 'object',
      $defs: { zip: { $anchor: 'zip', type: 'string', pattern: '^[0-9]+$' } },
      properties: { z: { $ref: '#zip' } },
      if: { properties: { z: { $ref: '#zip' } }, required: ['z'] },
      then: { required: ['ok'] },
    },
    guards: [{ pointer: '/if', values: [{ z: '1' }, { z: 'a' }, {}] }],
  },
  {
    name: 'nested if with not required',
    schema: {
      type: 'object',
      properties: {
        inner: {
          type: 'object',
          not: { required: ['secret'] },
          if: { properties: { m: { const: 1 } } },
          then: { required: ['n'] },
        },
      },
    },
    guards: [{ pointer: '/properties/inner/if', values: [{ m: 1 }, { m: 2 }] }],
  },
  {
    name: 'guard references an application anchor',
    schema: {
      type: 'object',
      properties: { zip: { type: 'string' }, city: { type: 'string' } },
      if: {
        properties: {
          zip: { $ref: 'https://app.invalid/modern/defs.json#zip' },
        },
        required: ['zip'],
      },
      then: { required: ['city'] },
    },
    guards: [{ pointer: '/if', values: [{ zip: '12345' }, { zip: 'x' }] }],
    application: true,
  },
];
describe.each([
  [
    '2019',
    () => new Ajv2019({ allErrors: true, strict: false }),
    create2019Validator,
  ],
  [
    '2020',
    () => new Ajv2020({ allErrors: true, strict: false }),
    create2020Validator,
  ],
] as const)('%s', (_name, makeInstance, adapterFor) => {
  it.each(rows)(
    '$name agrees with an equivalent native root-pointer guard (DETAIL I2)',
    ({ schema, guards, application }) => {
      for (const directGuardCompile of [false, true])
        for (const guardFirst of [false, true]) {
          const instance = makeInstance();
          const native = makeInstance();
          if (application) {
            registerApplication(instance);
            registerApplication(native);
          }
          const adapter = adapterFor(instance, { directGuardCompile });
          native.addSchema(schema, 'oracle-root');
          if (!guardFirst) adapter.compile(schema);
          for (const { pointer, values } of guards) {
            const oracle = native.compile({
              $ref: 'oracle-root#' + pointer,
            });
            const evaluate = adapter.compileGuard(schema, pointer);
            expect(values.map((value) => evaluate(value))).toEqual(
              values.map((value) => Boolean(oracle(value))),
            );
          }
          if (guardFirst) adapter.compile(schema);
          adapter.release?.(schema);
        }
    },
  );
});
