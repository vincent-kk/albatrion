import { JSONPointer, getValueByPointer } from '@winglet/common-utils';
import { describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScanner } from '../JsonSchemaScanner';
import { JsonSchemaScannerAsync } from '../JsonSchemaScannerAsync';

describe('JsonSchemaScanner', () => {
  describe('기본 동작 테스트', () => {
    it('should scan a simple schema without any options', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(schema);

      // Root object visit
      expect(visitor.enter).toHaveBeenCalledWith(
        schema,
        JSONPointer.Root,
        0,
        undefined,
      );

      // Properties visits
      expect(visitor.enter).toHaveBeenCalledWith(
        schema.properties.name,
        `${JSONPointer.Root}/properties/name`,
        1,
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        schema.properties.age,
        `${JSONPointer.Root}/properties/age`,
        1,
        undefined,
      );
    });

    it('should respect maxDepth option', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      };

      const scanner = new JsonSchemaScanner(visitor, { maxDepth: 1 });
      scanner.scan(schema);

      // Should only visit root and first level
      expect(visitor.enter).toHaveBeenCalledTimes(2);
      expect(visitor.enter).toHaveBeenCalledWith(
        schema,
        JSONPointer.Root,
        0,
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        schema.properties.user,
        `${JSONPointer.Root}/properties/user`,
        1,
        undefined,
      );
    });
  });

  describe('참조 해결 테스트', () => {
    it('should handle $ref resolution', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const resolveReference = vi.fn().mockReturnValue({ type: 'string' });
      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          ref: { $ref: '#/definitions/string' },
        },
      };

      const scanner = new JsonSchemaScanner(visitor, { resolveReference });
      scanner.scan(schema);

      expect(resolveReference).toHaveBeenCalledWith(
        '#/definitions/string',
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        { type: 'string' },
        `${JSONPointer.Root}/properties/ref -> (#/definitions/string)`,
        2,
        undefined,
      );
    });
  });

  describe('스키마 참조 및 정의 저장 테스트', () => {
    it('should store $ref schemas in external map with JsonPointer', () => {
      const jsonSchema: UnknownSchema = {
        type: 'object',
        properties: {
          user: { $ref: '#/definitions/user' },
          address: { $ref: '#/definitions/address' },
        },
        definitions: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
            },
          },
        },
      };

      const schemaMap = new Map<string, UnknownSchema>();
      const visitor = {
        enter: vi.fn((schema: UnknownSchema) => {
          if ('$ref' in schema) {
            schemaMap.set(
              schema.$ref,
              getValueByPointer(jsonSchema, schema.$ref),
            );
          }
        }),
        exit: vi.fn(),
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(jsonSchema);

      expect(schemaMap.size).toBe(2);
      expect(schemaMap.has(`#/definitions/user`)).toBe(true);
      expect(schemaMap.has(`#/definitions/address`)).toBe(true);
      expect(schemaMap.get(`#/definitions/user`)).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      });
      expect(schemaMap.get(`#/definitions/address`)).toEqual({
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
      });
    });

    it('should store $defs schemas directly in external map', () => {
      const defsMap = new Map<string, UnknownSchema>();
      const visitor = {
        enter: vi.fn((schema: UnknownSchema, path: string) => {
          if ('$defs' in schema) {
            for (const [key, value] of Object.entries(schema.$defs)) {
              defsMap.set(path + '/$defs/' + key, value as UnknownSchema);
            }
          }
        }),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'object',
        $defs: {
          stringType: { type: 'string', minLength: 1 },
          numberType: { type: 'number', minimum: 0 },
        },
        properties: {
          name: { type: 'string' },
        },
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(schema);

      expect(defsMap.size).toBe(2);
      expect(defsMap.has('#/$defs/stringType')).toBe(true);
      expect(defsMap.has('#/$defs/numberType')).toBe(true);
      expect(defsMap.get('#/$defs/stringType')).toEqual({
        type: 'string',
        minLength: 1,
      });
      expect(defsMap.get('#/$defs/numberType')).toEqual({
        type: 'number',
        minimum: 0,
      });
    });

    it('should handle both $ref and $defs in the same schema', () => {
      const schemaMap = new Map<string, UnknownSchema>();
      const defsMap = new Map<string, UnknownSchema>();

      const visitor = {
        enter: vi.fn((node: UnknownSchema, path: string) => {
          if ((node as any).$ref) {
            schemaMap.set(path, node);
          }
          if ((node as any).$defs) {
            for (const [key, value] of Object.entries((node as any).$defs)) {
              defsMap.set(key, value as UnknownSchema);
            }
          }
        }),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'object',
        $defs: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', pattern: '^\\+?\\d{10,}$' },
        },
        properties: {
          user: {
            type: 'object',
            properties: {
              primaryContact: { $ref: '#/$defs/email' },
              secondaryContact: { $ref: '#/$defs/phone' },
            },
          },
        },
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(schema);

      // Check $defs storage
      expect(defsMap.size).toBe(2);
      expect(defsMap.has('email')).toBe(true);
      expect(defsMap.has('phone')).toBe(true);
      expect(defsMap.get('email')).toEqual({
        type: 'string',
        format: 'email',
      });
      expect(defsMap.get('phone')).toEqual({
        type: 'string',
        pattern: '^\\+?\\d{10,}$',
      });

      // Check $ref storage
      expect(schemaMap.size).toBe(2);
      expect(
        schemaMap.has(
          `${JSONPointer.Root}/properties/user/properties/primaryContact`,
        ),
      ).toBe(true);
      expect(
        schemaMap.has(
          `${JSONPointer.Root}/properties/user/properties/secondaryContact`,
        ),
      ).toBe(true);
      expect(
        schemaMap.get(
          `${JSONPointer.Root}/properties/user/properties/primaryContact`,
        ),
      ).toEqual({
        $ref: '#/$defs/email',
      });
      expect(
        schemaMap.get(
          `${JSONPointer.Root}/properties/user/properties/secondaryContact`,
        ),
      ).toEqual({
        $ref: '#/$defs/phone',
      });
    });
  });
});

describe('JsonSchemaScannerAsync', () => {
  describe('기본 동작 테스트', () => {
    it('should scan a simple schema asynchronously', async () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const scanner = new JsonSchemaScannerAsync(visitor);
      await scanner.scan(schema);

      expect(visitor.enter).toHaveBeenCalledWith(
        schema,
        JSONPointer.Root,
        0,
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        schema.properties.name,
        `${JSONPointer.Root}/properties/name`,
        1,
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        schema.properties.age,
        `${JSONPointer.Root}/properties/age`,
        1,
        undefined,
      );
    });
  });

  describe('비동기 참조 해결 테스트', () => {
    it('should handle async $ref resolution', async () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const resolveReference = vi.fn().mockResolvedValue({ type: 'string' });
      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          ref: { $ref: '#/definitions/string' },
        },
      };

      const scanner = new JsonSchemaScannerAsync(visitor, { resolveReference });
      await scanner.scan(schema);

      expect(resolveReference).toHaveBeenCalledWith(
        '#/definitions/string',
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        { type: 'string' },
        `${JSONPointer.Root}/properties/ref -> (#/definitions/string)`,
        2,
        undefined,
      );
    });

    it('should handle failed async $ref resolution', async () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const resolveReference = vi.fn().mockResolvedValue(undefined);
      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          ref: { $ref: '#/definitions/nonexistent' },
        },
      };

      const scanner = new JsonSchemaScannerAsync(visitor, { resolveReference });
      await scanner.scan(schema);

      expect(resolveReference).toHaveBeenCalledWith(
        '#/definitions/nonexistent',
        undefined,
      );
      // Should not visit undefined reference
      expect(visitor.enter).not.toHaveBeenCalledWith(
        undefined,
        expect.any(String),
        expect.any(Number),
        undefined,
      );
    });
  });
});
