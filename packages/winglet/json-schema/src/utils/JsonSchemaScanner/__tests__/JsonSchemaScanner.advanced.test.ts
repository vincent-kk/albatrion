import { JSONPointer } from '@winglet/common-utils';
import { describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScanner } from '../JsonSchemaScanner';
import { JsonSchemaScannerAsync } from '../JsonSchemaScannerAsync';

describe('JsonSchemaScanner Advanced Features', () => {
  describe('복합 키워드 테스트', () => {
    it('should handle allOf, anyOf, oneOf keywords', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        allOf: [
          { type: 'object' },
          { type: 'object', properties: { name: { type: 'string' } } },
        ],
        anyOf: [{ type: 'number' }, { type: 'string' }],
        oneOf: [{ type: 'boolean' }, { type: 'null' }],
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(schema);

      // Check allOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.allOf[0],
          path: `${JSONPointer.Root}/allOf/0`,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.allOf[1],
          path: `${JSONPointer.Root}/allOf/1`,
          depth: 1,
        },
        undefined,
      );

      // Check anyOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.anyOf[0],
          path: `${JSONPointer.Root}/anyOf/0`,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.anyOf[1],
          path: `${JSONPointer.Root}/anyOf/1`,
          depth: 1,
        },
        undefined,
      );

      // Check oneOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.oneOf[0],
          path: `${JSONPointer.Root}/oneOf/0`,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.oneOf[1],
          path: `${JSONPointer.Root}/oneOf/1`,
          depth: 1,
        },
        undefined,
      );
    });
  });

  describe('조건부 키워드 테스트', () => {
    it('should handle if/then/else keywords', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        if: { type: 'string' },
        then: { minLength: 1 },
        else: { type: 'number' },
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(schema);

      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.if,
          path: `${JSONPointer.Root}/if`,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.then,
          path: `${JSONPointer.Root}/then`,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.else,
          path: `${JSONPointer.Root}/else`,
          depth: 1,
        },
        undefined,
      );
    });
  });

  describe('정의 및 참조 테스트', () => {
    it('should handle definitions and $defs', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        definitions: {
          stringType: { type: 'string' },
        },
        $defs: {
          numberType: { type: 'number' },
        },
      };

      const scanner = new JsonSchemaScanner(visitor);
      scanner.scan(schema);

      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.definitions.stringType,
          path: `${JSONPointer.Root}/definitions/stringType`,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.$defs.numberType,
          path: `${JSONPointer.Root}/$defs/numberType`,
          depth: 1,
        },
        undefined,
      );
    });
  });
});

describe('JsonSchemaScannerAsync Advanced Features', () => {
  describe('컨텍스트 활용 테스트', () => {
    it('should properly handle context in visitor and filter', async () => {
      const context = { visited: new Set<string>() };
      const visitor = {
        enter: vi.fn((node, path) => {
          context.visited.add(path);
        }),
        exit: vi.fn(),
      };

      const filter = vi.fn((node, path) => {
        return !context.visited.has(path);
      });

      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      };

      const scanner = new JsonSchemaScannerAsync(visitor, {
        filter,
        context,
      });
      await scanner.scan(schema);

      expect(filter).toHaveBeenCalled();
      expect(context.visited.size).toBeGreaterThan(0);
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema,
          path: JSONPointer.Root,
          depth: 0,
        },
        context,
      );
    });
  });

  describe('에러 처리 테스트', () => {
    it('should handle errors in async reference resolution', async () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const resolveReference = vi
        .fn()
        .mockRejectedValue(new Error('Failed to resolve'));
      const schema: UnknownSchema = {
        $ref: '#/definitions/error',
      };

      const scanner = new JsonSchemaScannerAsync(visitor, { resolveReference });

      await expect(scanner.scan(schema)).rejects.toThrow('Failed to resolve');
    });
  });
});
