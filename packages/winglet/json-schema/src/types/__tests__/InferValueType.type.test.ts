import { describe, expectTypeOf, it } from 'vitest';

import type {
  AnyValue,
  ArrayValue,
  BooleanValue,
  InferValueType,
  NullValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from '../value';

describe('InferValueType 타입 추론 테스트', () => {
  describe('Non-nullable 타입 (단일 type)', () => {
    it('{ type: "string" } → StringValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'string' }>
      >().toEqualTypeOf<StringValue>();
    });

    it('{ type: "number" } → NumberValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'number' }>
      >().toEqualTypeOf<NumberValue>();
    });

    it('{ type: "integer" } → NumberValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'integer' }>
      >().toEqualTypeOf<NumberValue>();
    });

    it('{ type: "boolean" } → BooleanValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'boolean' }>
      >().toEqualTypeOf<BooleanValue>();
    });

    it('{ type: "array" } → ArrayValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'array' }>
      >().toEqualTypeOf<ArrayValue>();
    });

    it('{ type: "object" } → ObjectValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'object' }>
      >().toEqualTypeOf<ObjectValue>();
    });

    it('{ type: "null" } → NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'null' }>
      >().toEqualTypeOf<NullValue>();
    });
  });

  describe('Nullable 타입 (배열 type with null)', () => {
    it('{ type: ["string", "null"] } → StringValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: ['string', 'null'] }>
      >().toEqualTypeOf<StringValue | NullValue>();
    });

    it('{ type: ["number", "null"] } → NumberValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: ['number', 'null'] }>
      >().toEqualTypeOf<NumberValue | NullValue>();
    });

    it('{ type: ["integer", "null"] } → NumberValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: ['integer', 'null'] }>
      >().toEqualTypeOf<NumberValue | NullValue>();
    });

    it('{ type: ["boolean", "null"] } → BooleanValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: ['boolean', 'null'] }>
      >().toEqualTypeOf<BooleanValue | NullValue>();
    });

    it('{ type: ["array", "null"] } → ArrayValue | NullValue', () => {
      expectTypeOf<InferValueType<{ type: ['array', 'null'] }>>().toEqualTypeOf<
        ArrayValue | NullValue
      >();
    });

    it('{ type: ["object", "null"] } → ObjectValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: ['object', 'null'] }>
      >().toEqualTypeOf<ObjectValue | NullValue>();
    });
  });

  describe('Edge cases', () => {
    it('{ type?: undefined } → AnyValue', () => {
      expectTypeOf<
        InferValueType<{ type?: undefined }>
      >().toEqualTypeOf<AnyValue>();
    });

    it('빈 객체 {} → AnyValue', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      expectTypeOf<InferValueType<{}>>().toEqualTypeOf<AnyValue>();
    });
  });
});
