import { describe, expect, test } from 'vitest';

import type { StringSchema } from '@/schema-form/types';

import { processOverwriteFields } from '../processOverwriteFields';

describe('processOverwriteFields', () => {
  test('First-Win과 Special 필드를 제외한 모든 필드는 덮어쓰기', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title', // First-Win 필드
      pattern: 'base-pattern', // Special 필드
      customField1: 'base-custom1',
      customField2: 'base-custom2',
    } as any;
    const source: Partial<StringSchema> = {
      title: 'Source Title', // 무시됨 (First-Win)
      pattern: 'source-pattern', // 무시됨 (Special)
      customField1: 'source-custom1', // 덮어쓰기
      customField3: 'source-custom3', // 추가
    } as any;

    processOverwriteFields(base, source);

    expect(base.title).toBe('Base Title'); // 유지
    expect(base.pattern).toBe('base-pattern'); // 유지
    expect((base as any).customField1).toBe('source-custom1'); // 덮어쓰기
    expect((base as any).customField2).toBe('base-custom2'); // 유지
    expect((base as any).customField3).toBe('source-custom3'); // 추가
  });

  test('base의 모든 필드는 유지되고 source의 허용된 필드들만 추가/덮어쓰기', () => {
    const base: StringSchema = {
      type: 'string',
      minLength: 5, // Special 필드 (유지)
      maxLength: 10, // Special 필드 (유지)
      customProp: 'base-value',
    } as any;
    const source: Partial<StringSchema> = {
      minLength: 3, // 무시됨 (Special)
      maxLength: 15, // 무시됨 (Special)
      customProp: 'source-value', // 덮어쓰기
      newProp: 'new-value', // 추가
    } as any;

    processOverwriteFields(base, source);

    expect(base.type).toBe('string');
    expect(base.minLength).toBe(5); // 유지
    expect(base.maxLength).toBe(10); // 유지
    expect((base as any).customProp).toBe('source-value'); // 덮어쓰기
    expect((base as any).newProp).toBe('new-value'); // 추가
  });

  test('undefined 값은 추가하지 않음', () => {
    const base: StringSchema = {
      type: 'string',
      customField: 'base-value',
    } as any;
    const source: Partial<StringSchema> = {
      customField: 'source-value',
      undefinedField: undefined,
    } as any;

    processOverwriteFields(base, source);

    expect((base as any).customField).toBe('source-value');
    expect((base as any).undefinedField).toBeUndefined();
  });

  test('모든 Special 필드들이 제외됨', () => {
    const base: StringSchema = {
      type: 'string',
      enum: ['a'], // Special
      const: 'value', // Special
      required: ['field'], // Special
      pattern: 'pattern', // Special
      minimum: 0, // Special
      maximum: 100, // Special
      customField: 'base',
    } as any;
    const source: Partial<StringSchema> = {
      enum: ['b'], // 무시됨
      const: 'other', // 무시됨
      required: ['other'], // 무시됨
      pattern: 'other', // 무시됨
      minimum: 10, // 무시됨
      maximum: 50, // 무시됨
      customField: 'source', // 덮어쓰기
    } as any;

    processOverwriteFields(base, source);

    expect(base.enum).toEqual(['a']); // 유지
    expect(base.const).toBe('value'); // 유지
    expect(base.required).toEqual(['field']); // 유지
    expect(base.pattern).toBe('pattern'); // 유지
    expect((base as any).minimum).toBe(0); // 유지
    expect((base as any).maximum).toBe(100); // 유지
    expect((base as any).customField).toBe('source'); // 덮어쓰기
  });
});
