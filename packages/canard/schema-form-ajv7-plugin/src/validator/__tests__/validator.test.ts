import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createValidatorFactory } from '../createValidatorFactory';
import { ajvValidatorPlugin } from '../validatorPlugin';

describe('createValidatorFactory', () => {
  let ajv: Ajv;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
  });

  it('should create a validator factory that returns null for valid data', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    } as unknown as JSONSchema;

    const validator = factory(schema);
    const result = await validator({ name: 'John', age: 30 });

    expect(result).toBeNull();
  });

  it('should return transformed errors for invalid data', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    } as unknown as JSONSchema;

    const validator = factory(schema);
    const result = await validator({ age: 30 }); // missing required 'name'

    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result![0]).toMatchObject({
      keyword: 'required',
      dataPath: '/name', // transformDataPath 적용됨
    });
  });

  it('should handle type validation errors', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    } as unknown as JSONSchema;

    const validator = factory(schema);
    const result = await validator({ name: 'John', age: 'not-a-number' });

    expect(result).not.toBeNull();
    expect(result![0]).toMatchObject({
      keyword: 'type',
      dataPath: '/age',
    });
  });

  it('should handle nested object validation', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            profile: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
              required: ['name'],
            },
          },
          required: ['profile'],
        },
      },
      required: ['user'],
    } as unknown as JSONSchema;

    const validator = factory(schema);
    const result = await validator({ user: { profile: {} } }); // missing name

    expect(result).not.toBeNull();
    expect(result![0]).toMatchObject({
      keyword: 'required',
      dataPath: '/user/profile/name',
    });
  });

  it('should handle array validation errors', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
            },
            required: ['id'],
          },
        },
      },
    } as unknown as JSONSchema;

    const validator = factory(schema);
    const result = await validator({ items: [{}] }); // missing id

    expect(result).not.toBeNull();
    expect(result![0]).toMatchObject({
      keyword: 'required',
      dataPath: '/items/0/id',
    });
  });

  it('should handle multiple validation errors', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number', minimum: 0 },
        email: { type: 'string' },
      },
      required: ['name', 'email'],
    } as unknown as JSONSchema;

    const validator = factory(schema);
    const result = await validator({ age: -5 }); // missing name, email + invalid age

    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(1);

    const errorKeywords = result!.map((err) => err.keyword);
    expect(errorKeywords).toContain('required');
    expect(errorKeywords).toContain('minimum');
  });

  it('should compile the authored schema without changing it', async () => {
    const compileSpy = vi.spyOn(ajv, 'compile');
    const factory = createValidatorFactory(ajv);
    const schema = { type: 'string' } as unknown as JSONSchema;

    factory(schema);

    expect(compileSpy).toHaveBeenCalledWith(schema);
    expect(schema).toEqual({ type: 'string' });
  });

  it('should throw non-validation errors', async () => {
    const factory = createValidatorFactory(ajv);
    const schema = { type: 'string' } as unknown as JSONSchema;

    // ajv.compile이 throw하는 에러를 시뮬레이션
    const mockCompile = vi.spyOn(ajv, 'compile').mockImplementation(() => {
      throw new Error('Compilation error');
    });

    await expect(() => factory(schema)).toThrow('Compilation error');

    mockCompile.mockRestore();
  });
});

describe('ajvValidatorPlugin', () => {
  beforeEach(() => {
    // 각 테스트 전에 ajvInstance를 리셋
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true, strict: false }));
  });

  it('should bind ajv instance correctly', () => {
    const ajv = new Ajv();

    ajvValidatorPlugin.bind!(ajv);

    // bind 함수가 인스턴스를 저장하는지 확인 (compile에서 사용됨을 통해 간접 확인)
    const schema = { type: 'string' } as unknown as JSONSchema;
    const validator = ajvValidatorPlugin.compile(schema);

    expect(typeof validator).toBe('function');
  });

  it('should create default ajv instance when none is bound', () => {
    const schema = { type: 'string' } as unknown as JSONSchema;

    const validator = ajvValidatorPlugin.compile(schema);

    expect(typeof validator).toBe('function');
  });

  it('should compile schema and return validator function', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    } as unknown as JSONSchema;

    const validator = ajvValidatorPlugin.compile(schema);

    expect(typeof validator).toBe('function');

    // Valid data
    const validResult = await validator({ name: 'John' });
    expect(validResult).toBeNull();

    // Invalid data
    const invalidResult = await validator({});
    expect(invalidResult).not.toBeNull();
    expect(invalidResult![0]).toMatchObject({
      keyword: 'required',
      dataPath: '/name',
    });
  });

  it('should use custom ajv instance when bound', async () => {
    const customAjv = new Ajv({
      allErrors: false, // 기본값과 다른 설정
      verbose: false,
    });

    ajvValidatorPlugin.bind!(customAjv);

    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name', 'age'],
    } as unknown as JSONSchema;

    const validator = ajvValidatorPlugin.compile(schema);
    const result = await validator({}); // 두 개 필드 모두 누락

    expect(result).not.toBeNull();
    // allErrors: false이므로 첫 번째 에러만 반환
    expect(result!.length).toBe(1);
  });

  it('should handle complex schema validation', async () => {
    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            personal: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2 },
                age: { type: 'number', minimum: 0, maximum: 150 },
              },
              required: ['name'],
            },
            contact: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                phone: { type: 'string' },
              },
              required: ['email'],
            },
          },
          required: ['personal', 'contact'],
        },
      },
      required: ['user'],
    } as unknown as JSONSchema;

    const validator = ajvValidatorPlugin.compile(schema);

    // Valid case
    const validData = {
      user: {
        personal: { name: 'John', age: 30 },
        contact: { email: 'john@example.com' },
      },
    };
    expect(await validator(validData)).toBeNull();

    // Invalid case
    const invalidData = {
      user: {
        personal: { name: 'A', age: -5 }, // name too short, age negative
        contact: {}, // missing email
      },
    };
    const result = await validator(invalidData);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(1);

    const dataPaths = result!.map((err) => err.dataPath);
    expect(dataPaths).toContain('/user/personal/name');
    expect(dataPaths).toContain('/user/personal/age');
    expect(dataPaths).toContain('/user/contact/email');
  });

  it('should handle array validation with plugin', async () => {
    const schema = {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            required: ['name'],
          },
        },
      },
    } as unknown as JSONSchema;

    const validator = ajvValidatorPlugin.compile(schema);
    const result = await validator({
      users: [
        { name: 'John', age: 30 },
        { age: 25 }, // missing name
        { name: 'Bob', age: 'invalid' }, // invalid age type
      ],
    });

    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);

    const dataPaths = result!.map((err) => err.dataPath);
    expect(dataPaths).toContain('/users/1/name');
    expect(dataPaths).toContain('/users/2/age');
  });
});
