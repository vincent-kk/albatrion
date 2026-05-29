import { describe, expect, it } from 'vitest';

import type { PartialJsonSchema } from '@/schema-form/types';

import { getExpressionFromSchema } from '../getExpressionFromSchema';

describe('getExpressionFromSchema', () => {
  it('properties가 없으면 null을 반환해야 합니다', () => {
    const schema: PartialJsonSchema = {};
    expect(getExpressionFromSchema(schema)).toBeNull();
  });

  it('properties가 plain object가 아니면 null을 반환해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: 'not an object' as any,
    };
    expect(getExpressionFromSchema(schema)).toBeNull();

    const schemaWithArray: PartialJsonSchema = {
      properties: [] as any,
    };
    expect(getExpressionFromSchema(schemaWithArray)).toBeNull();
  });

  it('type이나 $ref가 있는 속성은 무시해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        field1: { type: 'string' },
        field2: { $ref: '#/definitions/something' },
        field3: { const: 'value' },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('(./field3)==="value"');
  });

  it('const 값을 가진 속성을 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        status: { const: 'active' },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('(./status)==="active"');
  });

  it('boolean const 값을 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        isEnabled: { const: true },
        isDisabled: { const: false },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('((./isEnabled)===true)&&((./isDisabled)===false)');
  });

  it('number const 값을 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        count: { const: 42 },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('(./count)===42');
  });

  it('단일 값 enum을 const처럼 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        type: { enum: ['single'] },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('(./type)==="single"');
  });

  it('여러 값을 가진 enum을 includes로 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        role: { enum: ['admin', 'user', 'guest'] },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('["admin","user","guest"].includes((./role))');
  });

  it('빈 enum은 무시해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        empty: { enum: [] },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBeNull();
  });

  it('enum이 array가 아닌 경우 무시해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        invalid: { enum: 'not an array' as any },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBeNull();
  });

  it('여러 조건을 AND로 결합해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        status: { const: 'active' },
        role: { enum: ['admin', 'moderator'] },
        isVerified: { const: true },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe(
      '((./status)==="active")&&(["admin","moderator"].includes((./role)))&&((./isVerified)===true)',
    );
  });

  it('숫자 enum 값들을 올바르게 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        priority: { enum: [1, 2, 3] },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('[1,2,3].includes((./priority))');
  });

  it('mixed type enum 값들을 올바르게 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        value: { enum: ['text', 123, true, null] },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('["text",123,true,null].includes((./value))');
  });

  it('null const 값을 처리해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        nullable: { const: null },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('(./nullable)===null');
  });

  it('빈 properties 객체는 null을 반환해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {},
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBeNull();
  });

  it('모든 속성이 type이나 $ref를 가지면 null을 반환해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        field1: { type: 'string' },
        field2: { type: 'number' },
        field3: { $ref: '#/definitions/something' },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBeNull();
  });

  it('type과 const가 함께 있는 경우 type이 있으면 무시해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        field1: { type: 'string', const: 'value' } as any,
        field2: { const: 'included' },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('(./field2)==="included"');
  });

  it('$ref와 enum이 함께 있는 경우 $ref가 있으면 무시해야 합니다', () => {
    const schema: PartialJsonSchema = {
      properties: {
        field1: { $ref: '#/def', enum: ['a', 'b'] } as any,
        field2: { enum: ['x', 'y'] },
      },
    };
    const result = getExpressionFromSchema(schema);
    expect(result).toBe('["x","y"].includes((./field2))');
  });
});
