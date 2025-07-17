import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScannerAsync } from '../async/JsonSchemaScannerAsync';

describe('JsonSchemaScannerAsync - Schema Mutation', () => {
  describe('비동기 환경에서 mutate 옵션으로 schema 변경', () => {
    it('should apply mutations in async scan', async () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const scanner = new JsonSchemaScannerAsync({
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
                description: 'Password with requirements',
              };
            }

            return undefined;
          },
        },
      });

      const result = await scanner.scan(originalSchema);
      const finalSchema = result.getValue();

      expect(finalSchema).toEqual({
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
            description: 'Password with requirements',
          },
          age: { type: 'number' },
        },
      });
    });

    it('should handle mutations with async reference resolution', async () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          user: { $ref: '#/definitions/User' },
          posts: {
            type: 'array',
            items: { $ref: '#/definitions/Post' },
          },
        },
        definitions: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          Post: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      };

      const scanner = new JsonSchemaScannerAsync({
        options: {
          resolveReference: async (refPath) => {
            // 비동기 참조 해결 시뮬레이션
            await new Promise((resolve) => setTimeout(resolve, 10));

            if (refPath === '#/definitions/User') {
              return {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' }, // 추가 필드
                },
              };
            }

            if (refPath === '#/definitions/Post') {
              return {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  createdAt: { type: 'string' }, // 추가 필드
                },
              };
            }

            return undefined;
          },
          mutate: ({ schema, path }) => {
            // 해결된 User 스키마의 email 필드에 제약 추가
            if (path.endsWith('/properties/email')) {
              return {
                ...schema,
                format: 'email',
                description: 'User email from resolved reference',
              };
            }

            // 해결된 Post 스키마의 title 필드에 제약 추가
            if (path.endsWith('/properties/title')) {
              return {
                ...schema,
                minLength: 1,
                maxLength: 200,
                description: 'Post title with constraints',
              };
            }

            return undefined;
          },
        },
      });

      const result = await scanner.scan(originalSchema);
      const finalSchema = result.getValue();

      expect(finalSchema).toEqual({
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email from resolved reference',
              },
            },
          },
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 200,
                  description: 'Post title with constraints',
                },
                content: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
        definitions: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          Post: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Post title with constraints',
              },
              content: { type: 'string' },
            },
          },
        },
      });
    });

    it('should handle complex nested mutations in async context', async () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    profile: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        settings: {
                          type: 'object',
                          properties: {
                            theme: { type: 'string' },
                            language: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const scanner = new JsonSchemaScannerAsync({
        options: {
          mutate: ({ schema, path }) => {
            // 깊이 중첩된 name 필드 변경
            if (path.endsWith('/properties/name')) {
              return {
                ...schema,
                minLength: 1,
                maxLength: 100,
                description: 'User display name',
              };
            }

            // 테마 설정에 enum 추가
            if (path.endsWith('/properties/theme')) {
              return {
                ...schema,
                enum: ['light', 'dark', 'auto', 'system'],
                default: 'system',
                description: 'UI theme setting',
              };
            }

            // 언어 설정에 패턴 추가
            if (path.endsWith('/properties/language')) {
              return {
                ...schema,
                pattern: '^[a-z]{2}(-[A-Z]{2})?$',
                default: 'en-US',
                description: 'Language locale code',
              };
            }

            return undefined;
          },
        },
      });

      const result = await scanner.scan(originalSchema);
      const finalSchema = result.getValue();

      expect(finalSchema).toEqual({
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
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
                        settings: {
                          type: 'object',
                          properties: {
                            theme: {
                              type: 'string',
                              enum: ['light', 'dark', 'auto', 'system'],
                              default: 'system',
                              description: 'UI theme setting',
                            },
                            language: {
                              type: 'string',
                              pattern: '^[a-z]{2}(-[A-Z]{2})?$',
                              default: 'en-US',
                              description: 'Language locale code',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should handle mutations with async visitor callbacks', async () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          syncField: { type: 'string' },
          asyncField: { type: 'number' },
        },
      };

      const visitedPaths: string[] = [];
      const mutatedPaths: string[] = [];

      const scanner = new JsonSchemaScannerAsync({
        visitor: {
          enter: async (entry) => {
            // 비동기 visitor 콜백 시뮬레이션
            await new Promise((resolve) => setTimeout(resolve, 5));
            visitedPaths.push(entry.path);
          },
          exit: async () => {
            await new Promise((resolve) => setTimeout(resolve, 3));
            // exit에서도 path 기록
          },
        },
        options: {
          mutate: ({ schema, path }) => {
            if (path.endsWith('/properties/syncField')) {
              mutatedPaths.push(path);
              return {
                ...schema,
                minLength: 1,
                description: 'Sync field with constraints',
              };
            }

            if (path.endsWith('/properties/asyncField')) {
              mutatedPaths.push(path);
              return {
                ...schema,
                minimum: 0,
                maximum: 1000,
                description: 'Async field with range',
              };
            }

            return undefined;
          },
        },
      });

      const result = await scanner.scan(originalSchema);
      const finalSchema = result.getValue();

      expect(visitedPaths).toContain('#');
      expect(visitedPaths).toContain('#/properties/syncField');
      expect(visitedPaths).toContain('#/properties/asyncField');
      expect(mutatedPaths).toContain('#/properties/syncField');
      expect(mutatedPaths).toContain('#/properties/asyncField');

      expect(finalSchema).toEqual({
        type: 'object',
        properties: {
          syncField: {
            type: 'string',
            minLength: 1,
            description: 'Sync field with constraints',
          },
          asyncField: {
            type: 'number',
            minimum: 0,
            maximum: 1000,
            description: 'Async field with range',
          },
        },
      });
    });

    it('should handle mutations with async filter', async () => {
      const originalSchema: UnknownSchema = {
        type: 'object',
        properties: {
          includedField: { type: 'string', 'x-include': true },
          excludedField: { type: 'string', 'x-exclude': true },
          normalField: { type: 'string' },
        },
      };

      const scanner = new JsonSchemaScannerAsync({
        options: {
          filter: (entry) => {
            // x-exclude가 있는 필드는 제외
            if (entry.schema['x-exclude']) {
              return false;
            }

            return true;
          },
          mutate: ({ schema, path }) => {
            // 모든 string 필드에 기본 제약 추가
            if (schema.type === 'string') {
              return {
                ...schema,
                minLength: 1,
                description: `Processed field at ${path}`,
              };
            }

            return undefined;
          },
        },
      });

      const result = await scanner.scan(originalSchema);
      const finalSchema = result.getValue();

      expect(finalSchema).toEqual({
        type: 'object',
        properties: {
          includedField: {
            type: 'string',
            'x-include': true,
            minLength: 1,
            description: 'Processed field at #/properties/includedField',
          },
          excludedField: { type: 'string', 'x-exclude': true }, // 필터에 의해 처리되지 않음
          normalField: {
            type: 'string',
            minLength: 1,
            description: 'Processed field at #/properties/normalField',
          },
        },
      });
    });

    it('should handle multiple async scans on separate instances', async () => {
      const schema1: UnknownSchema = {
        type: 'object',
        properties: {
          field1: { type: 'string' },
        },
      };

      const schema2: UnknownSchema = {
        type: 'object',
        properties: {
          field2: { type: 'number' },
        },
      };

      const createScanner = () =>
        new JsonSchemaScannerAsync({
          options: {
            mutate: ({ schema }) => {
              if (schema.type === 'string') {
                return {
                  ...schema,
                  description: 'String field mutation',
                };
              }

              if (schema.type === 'number') {
                return {
                  ...schema,
                  description: 'Number field mutation',
                };
              }

              return undefined;
            },
          },
        });

      // 첫 번째 스캔 (새 인스턴스)
      const scanner1 = createScanner();
      const result1 = await scanner1.scan(schema1);
      const finalSchema1 = result1.getValue();

      expect(finalSchema1).toEqual({
        type: 'object',
        properties: {
          field1: {
            type: 'string',
            description: 'String field mutation',
          },
        },
      });

      // 두 번째 스캔 (새 인스턴스)
      const scanner2 = createScanner();
      const result2 = await scanner2.scan(schema2);
      const finalSchema2 = result2.getValue();

      expect(finalSchema2).toEqual({
        type: 'object',
        properties: {
          field2: {
            type: 'number',
            description: 'Number field mutation',
          },
        },
      });

      // 첫 번째 결과가 두 번째 스캔에 영향받지 않았는지 확인
      expect(result1.getValue()).toEqual({
        type: 'object',
        properties: {
          field1: {
            type: 'string',
            description: 'String field mutation',
          },
        },
      });
    });

    it('should handle concurrent async scans', async () => {
      const schema1: UnknownSchema = {
        type: 'object',
        properties: {
          field1: { type: 'string' },
        },
      };

      const schema2: UnknownSchema = {
        type: 'object',
        properties: {
          field2: { type: 'number' },
        },
      };

      const createScanner = (identifier: string) =>
        new JsonSchemaScannerAsync({
          options: {
            mutate: ({ schema }) => {
              if (schema.type === 'string') {
                return {
                  ...schema,
                  description: `String field - ${identifier}`,
                };
              }

              if (schema.type === 'number') {
                return {
                  ...schema,
                  description: `Number field - ${identifier}`,
                };
              }

              return undefined;
            },
          },
        });

      const scanner1 = createScanner('Scanner1');
      const scanner2 = createScanner('Scanner2');

      // 동시 실행
      const [result1, result2] = await Promise.all([
        scanner1.scan(schema1),
        scanner2.scan(schema2),
      ]);

      const finalSchema1 = result1.getValue();
      const finalSchema2 = result2.getValue();

      expect(finalSchema1).toEqual({
        type: 'object',
        properties: {
          field1: {
            type: 'string',
            description: 'String field - Scanner1',
          },
        },
      });

      expect(finalSchema2).toEqual({
        type: 'object',
        properties: {
          field2: {
            type: 'number',
            description: 'Number field - Scanner2',
          },
        },
      });
    });
  });
});
