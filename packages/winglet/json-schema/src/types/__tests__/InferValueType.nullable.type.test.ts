import { describe, expectTypeOf, it } from 'vitest';

import type { JsonSchema } from '../jsonSchema';
import type {
  ArrayValue,
  BooleanValue,
  InferValueType,
  NullValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from '../value';

/**
 * `nullable: true` 는 `type` 배열(`['string', 'null']`)로 대체된 deprecated 키워드지만,
 * 소비자 런타임(@canard/schema-form 의 BranchStrategy·validateSchemaType)은 여전히
 * 이를 해석해 null 을 허용한다. 값 타입 추론이 같은 계약을 따르지 않으면
 * `nullable: true` 스키마에 null 을 넣는 코드가 타입 오류가 되므로 그 대응을 고정한다.
 *
 * 배열 형태(`type: [..., 'null']`)의 커버리지는 InferValueType.type.test.ts 가 담당한다.
 */
describe('InferValueType — deprecated nullable 키워드', () => {
  describe('단일 type + nullable: true', () => {
    it('{ type: "string", nullable: true } → StringValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'string'; nullable: true }>
      >().toEqualTypeOf<StringValue | NullValue>();
    });

    it('{ type: "number", nullable: true } → NumberValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'number'; nullable: true }>
      >().toEqualTypeOf<NumberValue | NullValue>();
    });

    it('{ type: "integer", nullable: true } → NumberValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'integer'; nullable: true }>
      >().toEqualTypeOf<NumberValue | NullValue>();
    });

    it('{ type: "boolean", nullable: true } → BooleanValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'boolean'; nullable: true }>
      >().toEqualTypeOf<BooleanValue | NullValue>();
    });

    it('{ type: "array", nullable: true } → ArrayValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'array'; nullable: true }>
      >().toEqualTypeOf<ArrayValue | NullValue>();
    });

    it('{ type: "object", nullable: true } → ObjectValue | NullValue', () => {
      expectTypeOf<
        InferValueType<{ type: 'object'; nullable: true }>
      >().toEqualTypeOf<ObjectValue | NullValue>();
    });
  });

  describe('경계', () => {
    it('nullable: false 는 null 을 추가하지 않는다', () => {
      expectTypeOf<
        InferValueType<{ type: 'string'; nullable: false }>
      >().toEqualTypeOf<StringValue>();
    });

    it('type 배열이 이미 null 을 포함하면 중복되지 않는다', () => {
      expectTypeOf<
        InferValueType<{ type: ['string', 'null']; nullable: true }>
      >().toEqualTypeOf<StringValue | NullValue>();
    });

    it('null 없는 단일 멤버 배열은 그 멤버로 풀린다', () => {
      // 런타임(extractSchemaInfo)은 길이 1 배열을 type[0] 으로 정규화한다.
      // 배열을 벗기지 않으면 어느 분기에도 걸리지 않아 AnyValue 로 떨어져
      // 런타임보다 느슨해진다.
      expectTypeOf<
        InferValueType<{ type: ['string'] }>
      >().toEqualTypeOf<StringValue>();
    });

    it('단일 멤버 배열 + nullable: true 도 null 이 붙는다', () => {
      expectTypeOf<
        InferValueType<{ type: ['number']; nullable: true }>
      >().toEqualTypeOf<NumberValue | NullValue>();
    });

    it('nullable 은 properties 재귀에도 반영된다', () => {
      expectTypeOf<
        InferValueType<{
          type: 'object';
          additionalProperties: false;
          properties: { name: { type: 'string'; nullable: true } };
        }>
      >().toEqualTypeOf<{ name?: StringValue | NullValue }>();
    });

    it('nullable 객체는 선언된 properties 를 유지한 채 null 을 허용한다', () => {
      expectTypeOf<
        InferValueType<{
          type: 'object';
          nullable: true;
          additionalProperties: false;
          properties: { name: { type: 'string' } };
        }>
      >().toEqualTypeOf<{ name?: StringValue } | NullValue>();
    });

    it('nullable 이 boolean 으로 넓어지면 null 을 추가하지 않는다', () => {
      // 런타임은 `jsonSchema.nullable === true` 를 런타임 값으로 검사하므로 실제로
      // true 면 null 을 허용한다. 정적 타입은 그것을 알 수 없으니 null 을 붙이지
      // 않는다 — 런타임보다 엄격한 방향이라 잘못된 통과를 만들지 않는다.
      expectTypeOf<
        InferValueType<{ type: 'string'; nullable: boolean }>
      >().toEqualTypeOf<StringValue>();
    });

    it('satisfies JsonSchema 로 선언한 스키마에서도 nullable 이 유지된다', () => {
      const _schema = {
        type: 'object',
        additionalProperties: false,
        properties: {
          personalInfo: {
            type: 'object',
            nullable: true,
            additionalProperties: false,
            properties: { firstName: { type: 'string', nullable: true } },
          },
        },
      } satisfies JsonSchema;
      expectTypeOf<InferValueType<typeof _schema>>().toEqualTypeOf<{
        personalInfo?: { firstName?: StringValue | NullValue } | NullValue;
      }>();
    });
  });
});
