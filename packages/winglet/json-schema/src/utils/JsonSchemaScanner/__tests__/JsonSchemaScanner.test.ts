import { describe, expect, it, vi } from 'vitest';

import { JSONPointer } from '@/json-schema/enum';
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
