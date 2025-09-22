import { describe, expect, test } from 'vitest';
import { processFirstWinFields } from '../processFirstWinFields';
import type { StringSchema } from '@/schema-form/types';

describe('processFirstWinFields', () => {
  test('base에 있는 First-Win 필드는 유지', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title',
      format: 'email',
      description: 'Base Description'
    };
    const source: Partial<StringSchema> = {
      title: 'Source Title',
      format: 'uri',
      examples: ['example']
    };

    const result = processFirstWinFields(base, source);

    expect(result.title).toBe('Base Title');
    expect(result.format).toBe('email');
    expect(result.description).toBe('Base Description');
    expect(result.examples).toEqual(['example']); // base에 없으므로 source에서 가져옴
  });

  test('base에 없는 First-Win 필드는 source에서 가져옴', () => {
    const base: StringSchema = { type: 'string' };
    const source: Partial<StringSchema> = {
      title: 'Source Title',
      format: 'uri',
      description: 'Source Description',
      readOnly: true,
      writeOnly: false
    };

    const result = processFirstWinFields(base, source);

    expect(result.title).toBe('Source Title');
    expect(result.format).toBe('uri');
    expect(result.description).toBe('Source Description');
    expect(result.readOnly).toBe(true);
    expect(result.writeOnly).toBe(false);
  });

  test('둘 다 없는 필드는 결과에 포함되지 않음', () => {
    const base: StringSchema = { type: 'string' };
    const source: Partial<StringSchema> = {};

    const result = processFirstWinFields(base, source);

    expect(result.title).toBeUndefined();
    expect(result.format).toBeUndefined();
    expect(result.description).toBeUndefined();
  });

  test('모든 First-Win 필드를 처리', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title',
      '$comment': 'Base Comment'
    };
    const source: Partial<StringSchema> = {
      title: 'Source Title', // 무시됨
      description: 'Source Description', // 사용됨
      examples: ['example'], // 사용됨
      default: 'default', // 사용됨
      readOnly: true, // 사용됨
      writeOnly: false, // 사용됨
      format: 'email' // 사용됨
    };

    const result = processFirstWinFields(base, source);

    expect(result.title).toBe('Base Title');
    expect(result['$comment']).toBe('Base Comment');
    expect(result.description).toBe('Source Description');
    expect(result.examples).toEqual(['example']);
    expect(result.default).toBe('default');
    expect(result.readOnly).toBe(true);
    expect(result.writeOnly).toBe(false);
    expect(result.format).toBe('email');
  });
});