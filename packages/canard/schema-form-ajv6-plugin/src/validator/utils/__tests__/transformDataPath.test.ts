import type { ErrorObject } from 'ajv';
import { describe, expect, it } from 'vitest';

import { transformDataPath } from '../transformDataPath';

describe('transformDataPath', () => {
  it('should append missing property to existing dataPath for required errors', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        dataPath: '.user',
        schemaPath: '#/required',
        params: { missingProperty: 'name' },
        message: "should have required property 'name'",
      },
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.user.name');
    expect(result).toBe(errors); // 원본 배열이 수정됨
  });

  it('should handle required errors at root level (empty dataPath)', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'email' },
        message: "should have required property 'email'",
      },
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.email');
  });

  it('should handle required errors with undefined dataPath', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        schemaPath: '#/required',
        params: { missingProperty: 'phone' },
        message: "should have required property 'phone'",
      } as any,
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.phone');
  });

  it('should preserve dataPath for non-required errors', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'type',
        dataPath: '.age',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
        message: 'should be number',
      },
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.age');
  });

  it('should set empty string for non-required errors with empty dataPath', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'type',
        dataPath: '',
        schemaPath: '#/type',
        params: { type: 'object' },
        message: 'should be object',
      },
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('');
  });

  it('should set empty string for non-required errors with undefined dataPath', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'minimum',
        schemaPath: '#/minimum',
        params: { comparison: '>=', limit: 0 },
        message: 'should be >= 0',
      } as any,
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('');
  });

  it('should handle multiple mixed errors correctly', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        dataPath: '.user',
        schemaPath: '#/required',
        params: { missingProperty: 'name' },
        message: "should have required property 'name'",
      },
      {
        keyword: 'type',
        dataPath: '.age',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
        message: 'should be number',
      },
      {
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'email' },
        message: "should have required property 'email'",
      },
      {
        keyword: 'minimum',
        schemaPath: '#/minimum',
        params: { comparison: '>=', limit: 18 },
        message: 'should be >= 18',
      } as any,
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.user.name');
    expect(result[1].dataPath).toBe('.age');
    expect(result[2].dataPath).toBe('.email');
    expect(result[3].dataPath).toBe('');
    expect(result).toBe(errors); // 원본 배열이 수정됨
  });

  it('should handle deep nested dataPath with required error', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        dataPath: '.user.profile.settings',
        schemaPath:
          '#/properties/user/properties/profile/properties/settings/required',
        params: { missingProperty: 'theme' },
        message: "should have required property 'theme'",
      },
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.user.profile.settings.theme');
  });

  it('should handle empty errors array', () => {
    const errors: ErrorObject[] = [];

    const result = transformDataPath(errors);

    expect(result).toEqual([]);
    expect(result).toBe(errors); // 동일한 배열 참조
  });

  it('should handle required error without missingProperty param', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        dataPath: '.user',
        schemaPath: '#/required',
        params: {},
        message: 'should have required property',
      },
    ];

    const result = transformDataPath(errors);

    expect(result[0].dataPath).toBe('.user'); // missingProperty 없으면 변경되지 않음
  });
});
