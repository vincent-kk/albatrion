import { expectTypeOf, it } from 'vitest';

import type {
  FieldNode,
  InactiveValue,
  InactiveValueContext,
  InactiveValueResolver,
  JSONSchema,
} from '../../index';

it('types an inline declaration resolver with the shared interface', () => {
  const schema: JSONSchema = {
    type: 'string',
    controls: {
      inactiveValue: (value, context) => {
        expectTypeOf(value).toEqualTypeOf<unknown>();
        expectTypeOf(context).toEqualTypeOf<InactiveValueContext>();
        return context.dataPath;
      },
    },
  };
  expectTypeOf(schema).toMatchTypeOf<JSONSchema>();
});

it('exports one resolver interface for declarations and node listeners', () => {
  expectTypeOf<InactiveValue<string>>().toEqualTypeOf<
    string | InactiveValueResolver<string>
  >();
  expectTypeOf<
    Parameters<InactiveValueResolver<string>>[0]
  >().toEqualTypeOf<string>();
  expectTypeOf<ReturnType<InactiveValueResolver<string>>>().toEqualTypeOf<
    string | undefined
  >();
  expectTypeOf<
    Parameters<InactiveValueResolver<string>>[1]
  >().toEqualTypeOf<InactiveValueContext>();
  expectTypeOf<Parameters<FieldNode['onInactive']>[0]>().toEqualTypeOf<
    InactiveValueResolver<unknown>
  >();
  expectTypeOf<ReturnType<FieldNode['onInactive']>>().toEqualTypeOf<
    () => void
  >();
  const literal: JSONSchema = {
    type: 'string',
    controls: { inactiveValue: 'retained' },
  };
  const resolver: InactiveValueResolver<string> = (value) =>
    value.toUpperCase();
  const resolved: JSONSchema = {
    type: 'string',
    controls: { inactiveValue: resolver },
  };
  expectTypeOf(literal).toMatchTypeOf<JSONSchema>();
  expectTypeOf(resolved).toMatchTypeOf<JSONSchema>();
});
