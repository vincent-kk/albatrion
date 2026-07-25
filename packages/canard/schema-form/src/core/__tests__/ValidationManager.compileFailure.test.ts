import Ajv from 'ajv/dist/2020';
import { describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { ValidationMode } from '../nodes';
import { createValidatorFactory } from './utils/createValidatorFactory';

/**
 * A schema the validator refuses to compile leaves the form without validation,
 * so the console log is the only diagnosis a developer gets — FormTypeInput owns
 * no UI surface for it. These cases pin that the log names the actual cause
 * instead of attributing every failure to a circular reference.
 */
const buildAndCaptureErrors = (jsonSchema: any, validatorFactory?: any) => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  nodeFromJsonSchema({
    onChange: () => {},
    jsonSchema,
    validationMode: ValidationMode.OnChange,
    validatorFactory:
      validatorFactory ??
      createValidatorFactory(new Ajv({ allErrors: true, strict: false })),
  });
  const logged = spy.mock.calls.map((call) => call[0] as any);
  spy.mockRestore();
  return logged;
};

describe('ValidationManager — 컴파일 실패 분류', () => {
  it('nullable 모순은 SCHEMA_COMPILE_FAILED 로 보고하고 실제 사유를 담는다', () => {
    const logged = buildAndCaptureErrors({
      type: 'object',
      properties: { f: { type: ['string', 'null'], nullable: false } },
    });

    expect(logged).toHaveLength(1);
    expect(logged[0].code).toBe('JSON_SCHEMA_ERROR.SCHEMA_COMPILE_FAILED');
    expect(logged[0].message).toContain('JSON Schema compilation failed');
    expect(logged[0].message).toContain('contradicts nullable: false');
    // 순환 참조 진단으로 오인하게 만드는 문구가 없어야 한다
    expect(logged[0].message).not.toContain('Circular reference');
    expect(logged[0].message).not.toContain('$defs section');
  });

  // 미해결 `$ref` 는 여기서 다루지 않는다 — `type` 이 없는 스키마는 노드 생성
  // 단계에서 `UNKNOWN_JSON_SCHEMA` 로 먼저 throw 되어 컴파일까지 가지 않는다.

  it('원인이 다른 실패도 같은 코드로 묶인다', () => {
    const logged = buildAndCaptureErrors({
      type: 'object',
      properties: { f: { type: 'string', pattern: '[' } },
    });

    expect(logged).toHaveLength(1);
    expect(logged[0].code).toBe('JSON_SCHEMA_ERROR.SCHEMA_COMPILE_FAILED');
    expect(logged[0].message).toContain('Invalid regular expression');
  });

  it('스택 초과는 CIRCULAR_REFERENCE 진단을 유지한다', () => {
    // 순환 객체 그래프를 스키마로 넘기는 방식으로는 이 분기에 닿을 수 없다 —
    // `stripSchemaExtensions` 가 try 블록 밖에서 먼저 순회하다 죽는다. 컴파일러가
    // 스택을 초과하는 상황만 이 분기에 도달하므로 그 조건을 직접 만든다.
    const logged = buildAndCaptureErrors(
      { type: 'object', properties: { f: { type: 'string' } } },
      () => {
        throw new RangeError('Maximum call stack size exceeded');
      },
    );

    expect(logged).toHaveLength(1);
    expect(logged[0].code).toBe('JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE');
    expect(logged[0].message).toContain('Circular reference detected');
  });

  it('정상 nullable 스키마는 아무것도 기록하지 않는다', () => {
    expect(
      buildAndCaptureErrors({
        type: 'object',
        properties: {
          a: { type: ['string', 'null'] },
          b: { type: 'number', nullable: true },
        },
      }),
    ).toHaveLength(0);
  });
});
