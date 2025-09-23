import { describe, expect, test } from 'vitest';

import type { StringSchema } from '@/schema-form/types';

import { processFirstWinFields } from '../processFirstWinFields';

describe('processFirstWinFields', () => {
  test('base에 있는 First-Win 필드는 유지', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title',
      format: 'email',
      description: 'Base Description',
    };
    const source: Partial<StringSchema> = {
      title: 'Source Title',
      format: 'uri',
      examples: ['example'],
    };

    processFirstWinFields(base, source);

    expect(base.title).toBe('Base Title');
    expect(base.format).toBe('email');
    expect(base.description).toBe('Base Description');
    expect(base.examples).toEqual(['example']); // base에 없으므로 source에서 가져옴
  });

  test('base에 없는 First-Win 필드는 source에서 가져옴', () => {
    const base: StringSchema = { type: 'string' };
    const source: Partial<StringSchema> = {
      title: 'Source Title',
      format: 'uri',
      description: 'Source Description',
      readOnly: true,
      writeOnly: false,
    };

    processFirstWinFields(base, source);

    expect(base.title).toBe('Source Title');
    expect(base.format).toBe('uri');
    expect(base.description).toBe('Source Description');
    expect(base.readOnly).toBe(true);
    expect(base.writeOnly).toBe(false);
  });

  test('둘 다 없는 필드는 결과에 포함되지 않음', () => {
    const base: StringSchema = { type: 'string' };
    const source: Partial<StringSchema> = {};

    processFirstWinFields(base, source);

    expect(base.title).toBeUndefined();
    expect(base.format).toBeUndefined();
    expect(base.description).toBeUndefined();
  });

  test('모든 First-Win 필드를 처리', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title',
      $comment: 'Base Comment',
    };
    const source: Partial<StringSchema> = {
      title: 'Source Title', // 무시됨
      description: 'Source Description', // 사용됨
      examples: ['example'], // 사용됨
      default: 'default', // 사용됨
      readOnly: true, // 사용됨
      writeOnly: false, // 사용됨
      format: 'email', // 사용됨
    };

    processFirstWinFields(base, source);

    expect(base.title).toBe('Base Title');
    expect(base['$comment']).toBe('Base Comment');
    expect(base.description).toBe('Source Description');
    expect(base.examples).toEqual(['example']);
    expect(base.default).toBe('default');
    expect(base.readOnly).toBe(true);
    expect(base.writeOnly).toBe(false);
    expect(base.format).toBe('email');
  });
});
