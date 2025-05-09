import type { ErrorObject } from 'ajv';
import { beforeEach, describe, expect, it } from 'vitest';

import { transformErrors } from '../transformErrors';

describe('transformErrors', () => {
  let errors: ErrorObject[];

  beforeEach(() => {
    errors = [
      {
        keyword: 'required',
        instancePath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'name' },
        message: "should have required property 'name'",
      },
      {
        keyword: 'type',
        instancePath: '/age/1/koreanAge',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
        message: 'should be number',
      },
      {
        keyword: 'minimum',
        instancePath: '/age',
        schemaPath: '#/properties/age/minimum',
        params: { comparison: '>=', limit: 0 },
        message: 'should be >= 0',
      },
      {
        keyword: 'format',
        instancePath: '/email',
        schemaPath: '#/properties/email/format',
        params: { format: 'email' },
        message: 'should match format "email"',
      },
    ];
  });

  it('should transform errors with missing property', () => {
    const result = transformErrors(errors);
    expect(result).toEqual([
      {
        ...errors[0],
        key: undefined,
        instancePath: '',
        dataPath: '.name',
      },
      {
        ...errors[1],
        key: undefined,
        dataPath: '.age[1].koreanAge',
      },
      {
        ...errors[2],
        key: undefined,
        dataPath: '.age',
      },
      {
        ...errors[3],
        key: undefined,
        dataPath: '.email',
      },
    ]);
  });

  it('should add keys when useKey is true', () => {
    const result = transformErrors(errors, undefined, true);

    // key 값은 동적으로 생성되므로 실제 값을 검증하지 않고 존재 여부와 타입만 검증
    expect(result.length).toBe(4);
    expect(result[0].key).toBeGreaterThan(0);
    expect(result[1].key).toBeGreaterThan(0);
    expect(result[2].key).toBeGreaterThan(0);
    expect(result[3].key).toBeGreaterThan(0);

    // 나머지 속성들은 정확히 검증
    expect(result[0].dataPath).toBe('.name');
    expect(result[0].instancePath).toBe('');
    expect(result[1].dataPath).toBe('.age[1].koreanAge');
    expect(result[2].dataPath).toBe('.age');
    expect(result[3].dataPath).toBe('.email');
  });

  it('should omit errors with specified keywords', () => {
    const omits = new Set<string>(['type', 'format']);
    const result = transformErrors(errors, omits);
    expect(result).toEqual([
      {
        ...errors[0],
        key: undefined,
        dataPath: '.name',
        instancePath: '',
      },
      {
        ...errors[2],
        key: undefined,
        dataPath: '.age',
      },
    ]);
  });

  it('should apply both omits and useKey correctly', () => {
    const omits = new Set<string>(['minimum']);
    const result = transformErrors(errors, omits, true);

    // key 값은 동적으로 생성되므로 실제 값을 검증하지 않고 존재 여부와 타입만 검증
    expect(result.length).toBe(3);
    expect(typeof result[0].key).toBe('number');
    expect(typeof result[1].key).toBe('number');
    expect(typeof result[2].key).toBe('number');

    // dataPath와 keyword 검증
    expect(result[0].dataPath).toBe('.name');
    expect(result[0].keyword).toBe('required');
    expect(result[1].dataPath).toBe('.age[1].koreanAge');
    expect(result[1].keyword).toBe('type');
    expect(result[2].dataPath).toBe('.email');
    expect(result[2].keyword).toBe('format');
  });

  it('should handle empty omits set', () => {
    const omits = new Set<string>();
    const result = transformErrors(errors, omits);
    expect(result.length).toEqual(4);
  });

  it('should handle empty errors array', () => {
    const result = transformErrors([]);
    expect(result).toEqual([]);
  });

  it('should handle non-array input', () => {
    // @ts-expect-error ajv 에러 타입 확인
    const result = transformErrors(null);
    expect(result).toEqual([]);
  });
});
