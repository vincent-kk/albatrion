import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScanner } from '../sync/JsonSchemaScanner';

describe('JsonSchemaScanner - Schema Mutation', () => {
  describe('mutate옵션으로 schema 변경', () => {
    it('should apply validation rules in enter callback', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema, path }) => {
            // 이메일 필드에 포맷 유효성 검사 추가
            if (path.endsWith('/properties/email')) {
              return {
                ...schema,
                format: 'email',
                description: 'User email address',
              };
            }

            // 비밀번호 필드에 최소 길이 제약 추가
            if (path.endsWith('/properties/password')) {
              return {
                ...schema,
                minLength: 8,
                pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$',
                description:
                  'Password must contain at least 8 characters with letters and numbers',
              };
            }

            // 나이 필드에 범위 제약 추가
            if (path.endsWith('/properties/age')) {
              return {
                ...schema,
                minimum: 0,
                maximum: 150,
                description: 'User age',
              };
            }

            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          password: {
            type: 'string',
            minLength: 8,
            pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$',
            description:
              'Password must contain at least 8 characters with letters and numbers',
          },
          age: {
            type: 'number',
            minimum: 0,
            maximum: 150,
            description: 'User age',
          },
        },
      });
    });

    it('should transform array item schemas', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          scores: {
            type: 'array',
            items: { type: 'number' },
          },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema, path }) => {
            // 문자열 배열 아이템에 제약 추가
            if (path.endsWith('/properties/tags/items')) {
              return {
                ...schema,
                minLength: 1,
                maxLength: 50,
                pattern: '^[a-zA-Z0-9-_]+$',
              };
            }

            // 숫자 배열 아이템에 제약 추가
            if (path.endsWith('/properties/scores/items')) {
              return {
                ...schema,
                minimum: 0,
                maximum: 100,
                multipleOf: 0.1,
              };
            }

            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9-_]+$',
            },
          },
          scores: {
            type: 'array',
            items: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              multipleOf: 0.1,
            },
          },
        },
      });
    });

    it('should handle nested object schema mutations', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  bio: { type: 'string' },
                },
              },
              settings: {
                type: 'object',
                properties: {
                  theme: { type: 'string' },
                  notifications: { type: 'boolean' },
                },
              },
            },
          },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema, path }) => {
            // 이름 필드에 제약 추가
            if (path.endsWith('/properties/name')) {
              return {
                ...schema,
                minLength: 1,
                maxLength: 100,
                description: 'User display name',
              };
            }

            // 테마 필드에 enum 제약 추가
            if (path.endsWith('/properties/theme')) {
              return {
                ...schema,
                enum: ['light', 'dark', 'auto'],
                default: 'auto',
                description: 'UI theme preference',
              };
            }

            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                    description: 'User display name',
                  },
                  bio: { type: 'string' },
                },
              },
              settings: {
                type: 'object',
                properties: {
                  theme: {
                    type: 'string',
                    enum: ['light', 'dark', 'auto'],
                    default: 'auto',
                    description: 'UI theme preference',
                  },
                  notifications: { type: 'boolean' },
                },
              },
            },
          },
        },
      });
    });

    it('should conditionally mutate schemas based on schema properties', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          publicField: { type: 'string' },
          privateField: { type: 'string', 'x-internal': true },
          adminField: { type: 'string', 'x-admin-only': true },
          regularNumber: { type: 'number' },
          sensitiveNumber: { type: 'number', 'x-sensitive': true },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema }) => {
            // 내부 필드에 readOnly 속성 추가
            if (schema['x-internal']) {
              return {
                ...schema,
                readOnly: true,
                description: 'Internal use only',
              };
            }

            // 관리자 전용 필드에 writeOnly 속성 추가
            if (schema['x-admin-only']) {
              return {
                ...schema,
                writeOnly: true,
                description: 'Admin access required',
              };
            }

            // 민감한 숫자 필드에 보안 제약 추가
            if (schema['x-sensitive'] && schema.type === 'number') {
              return {
                ...schema,
                minimum: 0,
                format: 'encrypted',
                description: 'Sensitive numeric data',
              };
            }

            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          publicField: { type: 'string' },
          privateField: {
            type: 'string',
            'x-internal': true,
            readOnly: true,
            description: 'Internal use only',
          },
          adminField: {
            type: 'string',
            'x-admin-only': true,
            writeOnly: true,
            description: 'Admin access required',
          },
          regularNumber: { type: 'number' },
          sensitiveNumber: {
            type: 'number',
            'x-sensitive': true,
            minimum: 0,
            format: 'encrypted',
            description: 'Sensitive numeric data',
          },
        },
      });
    });

    it('should transform oneOf/anyOf/allOf schemas', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          flexible: {
            oneOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' },
            ],
          },
          union: {
            anyOf: [
              { type: 'object', properties: { name: { type: 'string' } } },
              { type: 'array', items: { type: 'string' } },
            ],
          },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema, path }) => {
            // oneOf 내부의 문자열 타입에 제약 추가
            if (path.includes('/oneOf/') && schema.type === 'string') {
              return {
                ...schema,
                minLength: 1,
                description: 'Non-empty string value',
              };
            }

            // anyOf 내부의 배열 타입에 제약 추가
            if (path.includes('/anyOf/') && schema.type === 'array') {
              return {
                ...schema,
                minItems: 1,
                maxItems: 10,
                description: 'Limited array items',
              };
            }

            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          flexible: {
            oneOf: [
              {
                type: 'string',
                minLength: 1,
                description: 'Non-empty string value',
              },
              { type: 'number' },
              { type: 'boolean' },
            ],
          },
          union: {
            anyOf: [
              { type: 'object', properties: { name: { type: 'string' } } },
              {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 10,
                description: 'Limited array items',
              },
            ],
          },
        },
      });
    });

    it('should change schema types completely', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          legacyId: { type: 'number' },
          oldFlag: { type: 'string' },
          deprecatedField: { type: 'object', properties: {} },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ path }) => {
            // 레거시 ID를 문자열로 변경
            if (path.endsWith('/properties/legacyId')) {
              return {
                type: 'string',
                pattern: '^[0-9]+$',
                description: 'Legacy ID as string',
              };
            }

            // 구식 플래그를 boolean으로 변경
            if (path.endsWith('/properties/oldFlag')) {
              return {
                type: 'boolean',
                default: false,
                description: 'Converted flag',
              };
            }

            // 폐기된 필드를 null로 변경
            if (path.endsWith('/properties/deprecatedField')) {
              return {
                type: 'null',
                description: 'Deprecated field',
              };
            }

            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          legacyId: {
            type: 'string',
            pattern: '^[0-9]+$',
            description: 'Legacy ID as string',
          },
          oldFlag: {
            type: 'boolean',
            default: false,
            description: 'Converted flag',
          },
          deprecatedField: {
            type: 'null',
            description: 'Deprecated field',
          },
        },
      });
    });

    it('should handle multiple mutations on same schema', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          data: { type: 'string' },
        },
      };

      let mutationCount = 0;

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema, path }) => {
            if (path.endsWith('/properties/data')) {
              mutationCount++;
              return {
                ...schema,
                minLength: 1,
                description: `Mutation ${mutationCount}`,
              };
            }
            return undefined;
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(mutationCount).toBe(1);
      expect(result).toEqual({
        type: 'object',
        properties: {
          data: {
            type: 'string',
            minLength: 1,
            description: 'Mutation 1',
          },
        },
      });
    });

    it('should not mutate when function returns undefined', () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          keepOriginal: { type: 'string' },
          modifyThis: { type: 'string' },
        },
      };

      const scanner = new JsonSchemaScanner({
        options: {
          mutate: ({ schema, path }) => {
            // modifyThis만 변경하고 나머지는 그대로 유지
            if (path.endsWith('/properties/modifyThis')) {
              return {
                ...schema,
                description: 'Modified field',
              };
            }
            return undefined; // 다른 필드는 변경하지 않음
          },
        },
      });

      const result = scanner.scan(originalSchema).getValue();

      expect(result).toEqual({
        type: 'object',
        properties: {
          keepOriginal: { type: 'string' }, // 원본 그대로
          modifyThis: {
            type: 'string',
            description: 'Modified field',
          },
        },
      });
    });
  });
});
