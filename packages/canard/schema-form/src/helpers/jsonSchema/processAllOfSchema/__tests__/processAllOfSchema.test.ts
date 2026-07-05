import { afterEach, describe, expect, it, vi } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { processAllOfSchema } from '../processAllOfSchema';

describe('processAllOfSchema', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allOf 항목들을 기반 스키마에 병합한다', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [{ required: ['name'] }],
    } as unknown as JsonSchema;
    const processed = processAllOfSchema(schema);
    expect(processed.allOf).toBeUndefined();
    expect(processed.required).toEqual(['name']);
  });

  it('allOf 항목에서 form 구성에 사용되지 않는 키워드를 dev 경고한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [
        {
          if: { properties: { name: { const: 'x' } } },
          then: { required: ['name'] },
        },
      ],
    } as unknown as JsonSchema;
    processAllOfSchema(schema);
    expect(warn).toHaveBeenCalledTimes(2); // 'if' + 'then'
    expect(warn.mock.calls[0][0]).toContain(
      'SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM',
    );
    expect(warn.mock.calls[0][0]).toContain("'if'");
  });

  it('미지원 키워드가 없으면 경고를 방출하지 않는다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      allOf: [{ minProperties: 1 }],
    } as unknown as JsonSchema;
    processAllOfSchema(schema);
    expect(warn).not.toHaveBeenCalled();
  });
});
