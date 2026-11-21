import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator as adapterFor } from '../index';

const makeInstance = () => new Ajv({ allErrors: true, strict: false });
const registerApplication = (ajv: ReturnType<typeof makeInstance>) => {
  ajv.addSchema({
    $id: 'https://app.invalid/address.json',
    type: 'object',
    properties: {
      zip: { type: 'string', pattern: '^[0-9]{5}$' },
      legacy: false,
    },
    required: ['zip'],
    additionalProperties: false,
  });
  ajv.addSchema({
    $id: 'https://app.invalid/defs.json',
    definitions: {
      name: { type: 'string', minLength: 2 },
      nr: { type: 'object', not: { required: ['banned'] } },
      tagged: { properties: { tag: { const: 'vip' } }, required: ['tag'] },
    },
  });
  ajv.addSchema({ type: 'integer', minimum: 1 }, 'app-positive');
  ajv.addSchema({
    $id: 'https://app.invalid/person.json',
    type: 'object',
    properties: {
      address: { $ref: 'address.json' },
      name: { $ref: 'defs.json#/definitions/name' },
      friends: { type: 'array', items: { $ref: '#' } },
    },
  });
};
const id = (tag: string) => `https://verify.invalid/${tag}.json`;

type GuardCase = {
  name: string;
  schema: Parameters<ReturnType<typeof adapterFor>['compile']>[0];
  guards: { pointer: string; values: unknown[] }[];
  application?: boolean;
};

const rows: GuardCase[] = [
  {
    name: 'if then else',
    schema: {
      type: 'object',
      properties: { kind: { type: 'string' }, extra: { type: 'string' } },
      if: { properties: { kind: { const: 'x' } }, required: ['kind'] },
      then: { required: ['extra'] },
      else: { properties: { extra: { maxLength: 1 } } },
    },
    guards: [{ pointer: '/if', values: [{ kind: 'x' }, { kind: 'y' }, {}] }],
  },
  {
    name: 'if with ref to definitions and $id',
    schema: {
      $id: id('if-ref'),
      type: 'object',
      definitions: {
        isX: { properties: { kind: { const: 'x' } }, required: ['kind'] },
      },
      properties: { kind: { type: 'string' }, extra: { type: 'string' } },
      if: { $ref: '#/definitions/isX' },
      then: { required: ['extra'] },
    },
    guards: [{ pointer: '/if', values: [{ kind: 'x' }, { kind: 'y' }] }],
  },
  {
    name: 'nested if inside property',
    schema: {
      type: 'object',
      properties: {
        inner: {
          type: 'object',
          properties: { mode: { type: 'string' }, n: { type: 'number' } },
          if: { properties: { mode: { const: 'big' } } },
          then: { properties: { n: { minimum: 10 } } },
        },
      },
    },
    guards: [
      {
        pointer: '/properties/inner/if',
        values: [{ mode: 'big' }, { mode: 'small' }],
      },
    ],
  },
  {
    name: 'explicit draft-07 $schema',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: { a: { type: 'string', minLength: 2 } },
      if: { properties: { a: { const: 'zz' } } },
      then: { required: ['b'] },
    },
    guards: [{ pointer: '/if', values: [{ a: 'zz' }, { a: 'q' }] }],
  },
  {
    name: 'root $id with empty fragment',
    schema: {
      $id: `${id('empty-frag')}#`,
      type: 'object',
      definitions: { n: { type: 'number', maximum: 3 } },
      properties: { n: { $ref: '#/definitions/n' } },
      if: { properties: { n: { const: 1 } } },
      then: { required: ['m'] },
    },
    guards: [{ pointer: '/if', values: [{ n: 1 }, { n: 2 }] }],
  },
  {
    name: 'if referencing embedded resource',
    schema: {
      $id: id('if-embedded'),
      definitions: {
        flag: {
          $id: 'flag.json',
          properties: { f: { const: true } },
          required: ['f'],
        },
      },
      type: 'object',
      properties: { f: { type: 'boolean' }, g: { type: 'string' } },
      if: { $ref: 'flag.json' },
      then: { required: ['g'] },
    },
    guards: [{ pointer: '/if', values: [{ f: true }, { f: false }] }],
  },
  {
    name: 'guard on oneOf branch',
    schema: {
      type: 'object',
      definitions: { cond: { properties: { t: { enum: ['a', 'b'] } } } },
      properties: { t: { type: 'string' } },
      oneOf: [
        { if: { $ref: '#/definitions/cond' }, then: { required: ['x'] } },
        { required: ['y'] },
      ],
    },
    guards: [{ pointer: '/oneOf/0/if', values: [{ t: 'a' }, { t: 'z' }] }],
  },
  {
    name: 'conditional guard references an application definition',
    schema: {
      $id: id('guard-app'),
      type: 'object',
      properties: { tag: { type: 'string' }, perk: { type: 'string' } },
      if: { $ref: 'https://app.invalid/defs.json#/definitions/tagged' },
      then: { required: ['perk'] },
    },
    guards: [
      { pointer: '/if', values: [{ tag: 'vip' }, { tag: 'basic' }, {}] },
    ],
    application: true,
  },
  {
    name: 'nested guard references an application document without root $id',
    schema: {
      type: 'object',
      properties: {
        inner: {
          type: 'object',
          if: { properties: { n: { $ref: 'app-positive' } }, required: ['n'] },
          then: { required: ['m'] },
        },
      },
    },
    guards: [
      {
        pointer: '/properties/inner/if',
        values: [{ n: 3 }, { n: 0 }, { n: 'x' }],
      },
    ],
    application: true,
  },
];

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
          const oracle = native.compile({ $ref: 'oracle-root#' + pointer });
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
