import { expectTypeOf, it } from 'vitest';

import type {
  InferValueType,
  JSONSchema,
  ObjectSchema,
  StringSchema,
} from '../../index';

it('retains known option names and types while allowing extra keys in literals', () => {
  const schema: JSONSchema = {
    type: 'string',
    options: { custom: { id: 1 }, trim: true },
  };
  const typed: JSONSchema<{ custom: number }> = {
    type: 'string',
    options: { custom: 1, other: true, trim: false },
  };
  const stringSchema: StringSchema = {
    type: 'string',
    options: { custom: 1, trim: true },
  };
  const objectSchema: ObjectSchema = {
    type: 'object',
    options: { custom: 1, propertyOrder: ['*'] },
  };
  expectTypeOf(typed.options!.custom).toEqualTypeOf<number>();
  expectTypeOf<NonNullable<JSONSchema['options']>['trim']>().toEqualTypeOf<
    boolean | undefined
  >();
  expectTypeOf<NonNullable<JSONSchema['options']>['terminal']>().toEqualTypeOf<
    boolean | undefined
  >();
  expectTypeOf<
    NonNullable<JSONSchema['options']>['propertyOrder']
  >().toEqualTypeOf<readonly string[] | undefined>();
  // @ts-expect-error A reserved boolean option cannot be a string.
  const malformed: JSONSchema = { type: 'string', options: { trim: 'yes' } };
  // @ts-expect-error The custom generic retains its value type.
  const genericMismatch: JSONSchema<{ custom: number }> = {
    type: 'string',
    options: { custom: 'no' },
  };
  // @ts-expect-error controls remains closed.
  const controls: JSONSchema = { type: 'string', controls: { custom: true } };
  void [
    schema,
    stringSchema,
    objectSchema,
    malformed,
    genericMismatch,
    controls,
  ];
});

it('does not let custom options change value inference', () => {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string', options: { custom: 1, trim: true } },
      count: { type: 'number' },
    },
    options: { custom: ['payload'] },
  } as const satisfies JSONSchema;
  expectTypeOf<InferValueType<typeof schema>>().toEqualTypeOf<{
    title?: string;
    count?: number;
  }>();
});
