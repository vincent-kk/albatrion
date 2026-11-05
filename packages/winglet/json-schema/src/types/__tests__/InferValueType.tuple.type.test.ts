import { describe, expectTypeOf, it } from 'vitest';

import type { ArraySchema } from '../jsonSchema';
import type { InferValueType, ObjectValue } from '../value';

// filid:contract value-tuples
describe('InferValueType prefixItems tuples', () => {
  const prefixItems = [{ type: 'string' }, { type: 'number' }] as const;
  const closedSchema = { type: 'array', prefixItems, items: false } as const;

  it('infers mutable optional positions and rejects wrong or extra items', () => {
    type Value = InferValueType<typeof closedSchema>;
    expectTypeOf<Value>().toEqualTypeOf<[string?, number?]>();
    const values: Value[] = [
      [],
      ['name'],
      ['name', 3],
      // @ts-expect-error The first position is a string.
      [3],
      // @ts-expect-error The second position is a number.
      ['name', '3'],
      // @ts-expect-error Closed tuples have no third position.
      ['name', 3, true],
    ];
    values[0][0] = 'mutable';
    expectTypeOf(values).toEqualTypeOf<Value[]>();
  });

  it('does not infer a minimum length from minItems', () => {
    const _schema = { ...closedSchema, minItems: 2 } as const;
    expectTypeOf<InferValueType<typeof _schema>>().toEqualTypeOf<
      [string?, number?]
    >();
    const value: InferValueType<typeof _schema> = [];
    expectTypeOf(value).toEqualTypeOf<[string?, number?]>();
  });

  it('allows any rest when items is omitted', () => {
    const _schema = { type: 'array', prefixItems } as const;
    type Value = InferValueType<typeof _schema>;
    expectTypeOf<Value>().toEqualTypeOf<[string?, number?, ...any[]]>();
    const values: Value[] = [[], ['name'], ['name', 3, true, 'tail', {}]];
    expectTypeOf(values).toEqualTypeOf<Value[]>();
  });

  it('allows any rest when items is true', () => {
    const _schema = { type: 'array', prefixItems, items: true } as const;
    expectTypeOf<InferValueType<typeof _schema>>().toEqualTypeOf<
      [string?, number?, ...any[]]
    >();
  });

  it('applies a schema only to the rest after the prefix', () => {
    const _schema = {
      type: 'array',
      prefixItems,
      items: { type: 'boolean' },
    } as const;
    type Value = InferValueType<typeof _schema>;
    expectTypeOf<Value>().toEqualTypeOf<[string?, number?, ...boolean[]]>();
    const values: Value[] = [
      [],
      ['name'],
      ['name', 3, true, false],
      // @ts-expect-error Typed rest does not replace the first position.
      [true],
      // @ts-expect-error Only booleans are allowed after the prefix.
      ['name', 3, 'tail'],
    ];
    expectTypeOf(values).toEqualTypeOf<Value[]>();
  });

  it('handles an empty finite prefix with closed, open and typed rest', () => {
    expectTypeOf<
      InferValueType<{ type: 'array'; prefixItems: readonly []; items: false }>
    >().toEqualTypeOf<[]>();
    expectTypeOf<
      InferValueType<{ type: 'array'; prefixItems: readonly [] }>
    >().toEqualTypeOf<any[]>();
    expectTypeOf<
      InferValueType<{
        type: 'array';
        prefixItems: readonly [];
        items: { type: 'boolean' };
      }>
    >().toEqualTypeOf<boolean[]>();
  });

  it('recurses through nested tuples, nullable positions and open objects', () => {
    const _schema = {
      type: 'array',
      prefixItems: [
        { type: 'array', prefixItems: [{ type: 'integer' }], items: false },
        {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string', nullable: true } },
        },
      ],
      items: { type: 'number', nullable: true },
    } as const;
    type Value = InferValueType<typeof _schema>;
    expectTypeOf<Value>().toEqualTypeOf<
      [
        [number?]?,
        ({ name?: string | null } & ObjectValue)?,
        ...(number | null)[],
      ]
    >();
    const value: Value = [[1], { extra: true }, null, 2];
    expectTypeOf(value).toEqualTypeOf<Value>();
  });

  it('retains both nullable notations on tuple arrays', () => {
    expectTypeOf<
      InferValueType<typeof closedSchema & { nullable: true }>
    >().toEqualTypeOf<[string?, number?] | null>();
    expectTypeOf<
      InferValueType<{
        type: readonly ['array', 'null'];
        prefixItems: typeof prefixItems;
        items: false;
      }>
    >().toEqualTypeOf<[string?, number?] | null>();
  });

  it('keeps widened mutable and readonly prefixes on the items fallback', () => {
    expectTypeOf<
      InferValueType<{
        type: 'array';
        prefixItems: { type: 'string' }[];
        items: { type: 'boolean' };
      }>
    >().toEqualTypeOf<boolean[]>();
    expectTypeOf<
      InferValueType<{
        type: 'array';
        prefixItems: readonly { type: 'string' }[];
        items: false;
      }>
    >().toEqualTypeOf<any[]>();
    expectTypeOf<
      InferValueType<{ type: 'array'; prefixItems: readonly unknown[] }>
    >().toEqualTypeOf<any[]>();
  });

  it('keeps nonfinite variadic prefixes on the items fallback', () => {
    expectTypeOf<
      InferValueType<{
        type: 'array';
        prefixItems: readonly [{ type: 'string' }, ...{ type: 'number' }[]];
        items: { type: 'boolean' };
      }>
    >().toEqualTypeOf<boolean[]>();
  });

  it('keeps nonliteral and optional prefixes broad', () => {
    expectTypeOf<InferValueType<ArraySchema>>().toEqualTypeOf<any[] | null>();
    expectTypeOf<
      InferValueType<{
        type: 'array';
        prefixItems?: typeof prefixItems;
        items: { type: 'boolean' };
      }>
    >().toEqualTypeOf<boolean[]>();
  });

  it('preserves homogeneous items and legacy items-array inference', () => {
    expectTypeOf<
      InferValueType<{ type: 'array'; items: { type: 'string' } }>
    >().toEqualTypeOf<string[]>();
    expectTypeOf<
      InferValueType<{ type: 'array'; items: false }>
    >().toEqualTypeOf<any[]>();
    expectTypeOf<
      InferValueType<{
        type: 'array';
        items: readonly [{ type: 'string' }, { type: 'number' }];
        additionalItems: false;
      }>
    >().toEqualTypeOf<any[]>();
  });

  it('preserves optional open object properties containing tuples', () => {
    const _schema = {
      type: 'object',
      required: ['tuple'],
      properties: { tuple: closedSchema },
    } as const;
    expectTypeOf<InferValueType<typeof _schema>>().toEqualTypeOf<
      { tuple?: [string?, number?] } & ObjectValue
    >();
  });
});
