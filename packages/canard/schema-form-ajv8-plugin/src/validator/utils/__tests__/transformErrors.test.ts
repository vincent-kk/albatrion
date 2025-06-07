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
