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
    ]);
  });

  it('should add keys when useKey is true', () => {
    const result = transformErrors(errors, true);
    expect(result).toEqual([
      {
        ...errors[0],
        key: 1,
        dataPath: '.name',
        instancePath: '',
      },
      {
        ...errors[1],
        key: 2,
        dataPath: '.age[1].koreanAge',
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
