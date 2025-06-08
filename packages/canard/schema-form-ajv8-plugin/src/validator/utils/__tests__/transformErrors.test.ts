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
        keyword: 'required',
        dataPath: '.name',
        message: "should have required property 'name'",
        details: { missingProperty: 'name' },
        source: errors[0],
        key: undefined,
      },
      {
        keyword: 'type',
        dataPath: '.age[1].koreanAge',
        message: 'should be number',
        details: { type: 'number' },
        source: errors[1],
        key: undefined,
      },
      {
        keyword: 'minimum',
        dataPath: '.age',
        message: 'should be >= 0',
        details: { comparison: '>=', limit: 0 },
        source: errors[2],
        key: undefined,
      },
      {
        keyword: 'format',
        dataPath: '.email',
        message: 'should match format "email"',
        details: { format: 'email' },
        source: errors[3],
        key: undefined,
      },
    ]);
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
