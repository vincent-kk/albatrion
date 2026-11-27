import { describe, expectTypeOf, it } from 'vitest';

import type { FormHandle, FormProps } from '@/schema-form/components/Form';

import type { InferValueType } from '../schema/value';

// filid:contract value-tuples
describe('schema-form tuple value inference', () => {
  const prefixItems = [{ type: 'string' }, { type: 'number' }] as const;
  const closedSchema = { type: 'array', prefixItems, items: false } as const;

  it('delegates closed tuple inference with optional positions', () => {
    type Value = InferValueType<typeof closedSchema>;
    expectTypeOf<Value>().toEqualTypeOf<[string?, number?]>();
    const values: Value[] = [
      [],
      ['name'],
      ['name', 3],
      // @ts-expect-error The first position must be a string.
      [3],
      // @ts-expect-error Closed tuples reject additional items.
      ['name', 3, true],
    ];
    expectTypeOf(values).toEqualTypeOf<Value[]>();
  });

  it('carries tuple positions into the default FormHandle value', () => {
    type Handle = FormHandle<typeof closedSchema>;
    expectTypeOf<ReturnType<Handle['getValue']>>().toEqualTypeOf<
      [string?, number?]
    >();
    type Input = Parameters<Handle['setValue']>[0];
    const valid: Input = ['name', 3];
    // @ts-expect-error FormHandle rejects a wrong second position.
    const wrong: Input = ['name', '3'];
    expectTypeOf(valid).toExtend<Input>();
    expectTypeOf(wrong).toExtend<Input>();
  });

  it('accepts a prefix and typed rest through Form defaultValue typing', () => {
    const schema = {
      type: 'array',
      prefixItems,
      items: { type: 'boolean' },
    } as const;
    type Props = FormProps<typeof schema>;
    expectTypeOf<Props['defaultValue']>().toEqualTypeOf<
      [string?, number?, ...boolean[]] | undefined
    >();
    const props: Props = {
      jsonSchema: schema,
      defaultValue: ['name', 3, true, false],
    };
    const wrong: Props = {
      jsonSchema: schema,
      // @ts-expect-error Items after the prefix must be boolean.
      defaultValue: ['name', 3, 'tail'],
    };
    expectTypeOf(props).toEqualTypeOf<Props>();
    expectTypeOf(wrong).toEqualTypeOf<Props>();
  });

  it('retains nullable tuples inside optional open object properties', () => {
    const _schema = {
      type: 'object',
      required: ['tuple'],
      properties: { tuple: { ...closedSchema, nullable: true } },
    } as const;
    expectTypeOf<InferValueType<typeof _schema>>().toEqualTypeOf<
      { tuple?: [string?, number?] | null } & Record<string, any>
    >();
  });

  it('preserves virtual values and homogeneous array inference', () => {
    expectTypeOf<
      InferValueType<{ type: 'virtual'; prefixItems: typeof prefixItems }>
    >().toEqualTypeOf<any[]>();
    expectTypeOf<
      InferValueType<{ type: 'array'; items: { type: 'string' } }>
    >().toEqualTypeOf<string[]>();
  });

  it('preserves inline oneOf handling while inferring tuple branch values', () => {
    expectTypeOf<
      InferValueType<{
        oneOf: readonly [
          typeof closedSchema,
          { type: 'array'; items: { type: 'boolean' } },
          { type: 'null' },
        ];
      }>
    >().toEqualTypeOf<[string?, number?] | boolean[] | null>();
    expectTypeOf<
      InferValueType<{
        type: 'array';
        items: { type: 'string' };
        oneOf: readonly [typeof closedSchema];
      }>
    >().toEqualTypeOf<string[]>();
  });
});
