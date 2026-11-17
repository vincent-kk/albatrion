import { describe, expectTypeOf, it } from 'vitest';

import type {
  ArraySchema,
  JSONSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from '../schema/jsonSchema';

describe('discriminator object hosts', () => {
  it('accepts object and nullable object hosts', () => {
    const object: JSONSchema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      oneOf: [{ properties: { kind: { const: 'a' } } }],
    };
    const nullable: JSONSchema = {
      type: ['object', 'null'],
      controls: { discriminator: 'kind' },
      oneOf: [{ properties: { kind: { const: 'a' } } }],
    };
    const nullFirst: JSONSchema = {
      type: ['null', 'object'],
      controls: { discriminator: 'kind' },
      oneOf: [{ properties: { kind: { const: 'a' } } }],
    };
    const alias: ObjectSchema = {
      type: 'object',
      controls: { discriminator: 'kind' },
    };
    expectTypeOf([object, nullable, nullFirst, alias]).toBeArray();
  });

  it('rejects non-object and untyped hosts', () => {
    // @ts-expect-error -- a string host cannot select object properties
    const string: JSONSchema = {
      type: 'string',
      controls: { discriminator: 'kind' },
    };
    // @ts-expect-error -- an array host cannot select object properties
    const array: JSONSchema = {
      type: 'array',
      controls: { discriminator: 'kind' },
    };
    // @ts-expect-error -- a number host cannot select object properties
    const number: JSONSchema = {
      type: 'number',
      controls: { discriminator: 'kind' },
    };
    // @ts-expect-error -- multiple non-null kinds are a terminal union host
    const mixed: JSONSchema = {
      type: ['object', 'string'],
      controls: { discriminator: 'kind' },
    };
    // @ts-expect-error -- an object host type must be declared
    const untyped: JSONSchema = { controls: { discriminator: 'kind' } };
    expectTypeOf([string, array, number, mixed, untyped]).toBeArray();
  });

  it('restricts the per-kind aliases', () => {
    const string: StringSchema = {
      type: 'string',
      // @ts-expect-error -- string aliases reject the object-only key
      controls: { discriminator: 'kind' },
    };
    const array: ArraySchema = {
      type: 'array',
      // @ts-expect-error -- array aliases reject the object-only key
      controls: { discriminator: 'kind' },
    };
    const number: NumberSchema = {
      type: 'number',
      // @ts-expect-error -- number aliases reject the object-only key
      controls: { discriminator: 'kind' },
    };
    expectTypeOf([string, array, number]).toBeArray();
  });

  it('preserves fragments, non-object controls and unrestricted type arrays', () => {
    const fragment: JSONSchema = { controls: { active: './enabled' } };
    const string: JSONSchema = {
      type: 'string',
      controls: { injectTo: () => undefined, watch: ['../kind'] },
    };
    const mixed: JSONSchema = { type: ['string', 'object'] };
    expectTypeOf([fragment, string, mixed]).toBeArray();
  });
});
