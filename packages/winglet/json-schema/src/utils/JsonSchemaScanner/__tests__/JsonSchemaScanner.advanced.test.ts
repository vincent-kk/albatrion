import { JSONPointer } from '@winglet/json';
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

      const scanner = new JsonSchemaScanner({ visitor });
      scanner.scan(schema);

      // Check allOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.allOf[0],
          path: `${JSONPointer.Root}/allOf/0`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.allOf[1],
          path: `${JSONPointer.Root}/allOf/1`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );

      // Check anyOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.anyOf[0],
          path: `${JSONPointer.Root}/anyOf/0`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.anyOf[1],
          path: `${JSONPointer.Root}/anyOf/1`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );

      // Check oneOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.oneOf[0],
          path: `${JSONPointer.Root}/oneOf/0`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.oneOf[1],
          path: `${JSONPointer.Root}/oneOf/1`,
          dataPath: JSONPointer.Root,
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

      const scanner = new JsonSchemaScanner({ visitor });
      scanner.scan(schema);

      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.if,
          path: `${JSONPointer.Root}/if`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.then,
          path: `${JSONPointer.Root}/then`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.else,
          path: `${JSONPointer.Root}/else`,
          dataPath: JSONPointer.Root,
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

      const scanner = new JsonSchemaScanner({ visitor });
      scanner.scan(schema);

      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.definitions.stringType,
          path: `${JSONPointer.Root}/definitions/stringType`,
          dataPath: JSONPointer.Root,
          depth: 1,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.$defs.numberType,
          path: `${JSONPointer.Root}/$defs/numberType`,
          dataPath: JSONPointer.Root,
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
        enter: vi.fn((_, path) => {
          context.visited.add(path);
        }),
        exit: vi.fn(),
      };

      const filter = vi.fn((_, path) => {
        return !context.visited.has(path);
      });

      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      };

      const scanner = new JsonSchemaScannerAsync({
        visitor,
        options: {
          filter,
          context,
        },
      });
      await scanner.scan(schema);

      expect(filter).toHaveBeenCalled();
      expect(context.visited.size).toBeGreaterThan(0);
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema,
          path: JSONPointer.Root,
          dataPath: JSONPointer.Root,
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

      const scanner = new JsonSchemaScannerAsync({
        visitor,
        options: { resolveReference },
      });

      await expect(scanner.scan(schema)).rejects.toThrow('Failed to resolve');
    });
  });
});

describe('JsonSchemaScanner/JsonSchemaScannerAsync 스펙 테스트', () => {
  it('filter가 false를 반환하면 하위 노드를 방문하지 않는다', () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const filter = vi
      .fn()
      .mockImplementation(
        ({ path }: { schema: UnknownSchema; path: string }) =>
          path === JSONPointer.Root,
      );
    const schema: UnknownSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
    };
    const scanner = new JsonSchemaScanner({ visitor, options: { filter } });
    scanner.scan(schema);
    expect(visitor.enter).toHaveBeenCalledTimes(1);
    expect(visitor.enter).toHaveBeenCalledWith(
      {
        schema,
        path: JSONPointer.Root,
        dataPath: JSONPointer.Root,
        depth: 0,
      },
      undefined,
    );
  });

  it('maxDepth가 0이면 루트만 방문한다', () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const schema: UnknownSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
    };
    const scanner = new JsonSchemaScanner({
      visitor,
      options: { maxDepth: 0 },
    });
    scanner.scan(schema);
    expect(visitor.enter).toHaveBeenCalledTimes(1);
    expect(visitor.enter).toHaveBeenCalledWith(
      {
        schema,
        path: JSONPointer.Root,
        dataPath: JSONPointer.Root,
        depth: 0,
      },
      undefined,
    );
  });

  it('순환 참조($ref)가 있어도 무한루프 없이 종료된다', () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const schema: UnknownSchema = { $ref: '#/self' };
    const resolveReference = vi.fn().mockReturnValue(schema);
    const scanner = new JsonSchemaScanner({
      visitor,
      options: { resolveReference },
    });
    scanner.scan(schema);
    // 무한루프 없이 한 번만 방문
    expect(visitor.enter).not.toHaveBeenCalledWith(undefined, undefined);
  });

  it('exit 훅이 없어도 예외 없이 동작한다', () => {
    const visitor = { enter: vi.fn() };
    const schema: UnknownSchema = { type: 'string' };
    const scanner = new JsonSchemaScanner({ visitor });
    expect(() => scanner.scan(schema)).not.toThrow();
  });

  it('context가 모든 훅에 정확히 전달된다', async () => {
    const context = { value: 42 };
    const visitor = {
      enter: vi.fn(),
      exit: vi.fn(),
    };
    const filter = vi.fn().mockReturnValue(true);
    const resolveReference = vi.fn().mockResolvedValue({ type: 'string' });
    const schema: UnknownSchema = { $ref: '#/ref' };
    const scanner = new JsonSchemaScannerAsync({
      visitor,
      options: { filter, resolveReference, context },
    });
    await scanner.scan(schema);
    expect(visitor.enter).toHaveBeenCalledWith(
      {
        schema: {
          type: 'string',
        },
        referencePath: '#/ref',
        referenceResolved: true,
        path: JSONPointer.Root,
        dataPath: JSONPointer.Root,
        depth: 0,
      },
      context,
    );
    expect(filter).toHaveBeenCalledWith(
      {
        depth: 0,
        path: '#',
        dataPath: JSONPointer.Root,
        referencePath: '#/ref',
        referenceResolved: true,
        schema: {
          type: 'string',
        },
      },
      context,
    );
  });

  it('비동기 resolveReference에서 예외 발생 시 에러를 전파한다', async () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const resolveReference = vi.fn().mockRejectedValue(new Error('fail'));
    const schema: UnknownSchema = { $ref: '#/fail' };
    const scanner = new JsonSchemaScannerAsync({
      visitor,
      options: { resolveReference },
    });
    await expect(scanner.scan(schema)).rejects.toThrow('fail');
  });
});
