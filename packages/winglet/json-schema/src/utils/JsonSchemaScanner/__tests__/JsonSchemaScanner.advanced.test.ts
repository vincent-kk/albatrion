import { JSONPointer, getValue } from '@winglet/json/pointer';
import { describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScannerAsync } from '../async/JsonSchemaScannerAsync';
import { JsonSchemaScanner } from '../sync/JsonSchemaScanner';

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
          path: `${JSONPointer.Fragment}/allOf/0`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'allOf',
          variant: 0,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.allOf[1],
          path: `${JSONPointer.Fragment}/allOf/1`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'allOf',
          variant: 1,
        },
        undefined,
      );

      // Check anyOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.anyOf[0],
          path: `${JSONPointer.Fragment}/anyOf/0`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'anyOf',
          variant: 0,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.anyOf[1],
          path: `${JSONPointer.Fragment}/anyOf/1`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'anyOf',
          variant: 1,
        },
        undefined,
      );

      // Check oneOf visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.oneOf[0],
          path: `${JSONPointer.Fragment}/oneOf/0`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'oneOf',
          variant: 0,
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.oneOf[1],
          path: `${JSONPointer.Fragment}/oneOf/1`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'oneOf',
          variant: 1,
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
          path: `${JSONPointer.Fragment}/if`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'if',
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.then,
          path: `${JSONPointer.Fragment}/then`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'then',
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.else,
          path: `${JSONPointer.Fragment}/else`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'else',
        },
        undefined,
      );
    });
  });

  describe('prefixItems 키워드 테스트', () => {
    it('should handle prefixItems with array of schemas', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
        ],
      };

      const scanner = new JsonSchemaScanner({ visitor });
      scanner.scan(schema);

      // Check prefixItems[0] visit
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.prefixItems[0],
          path: `${JSONPointer.Fragment}/prefixItems/0`,
          dataPath: `/0`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 0,
        },
        undefined,
      );

      // Check prefixItems[1] visit
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.prefixItems[1],
          path: `${JSONPointer.Fragment}/prefixItems/1`,
          dataPath: `/1`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 1,
        },
        undefined,
      );

      // Check prefixItems[2] visit
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.prefixItems[2],
          path: `${JSONPointer.Fragment}/prefixItems/2`,
          dataPath: `/2`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 2,
        },
        undefined,
      );
    });

    it('should handle prefixItems with $ref schemas', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const resolvedStringSchema = { type: 'string', minLength: 1 };
      const resolvedNumberSchema = { type: 'number', minimum: 0 };

      const resolveReference = vi.fn().mockImplementation((ref: string) => {
        if (ref === '#/$defs/stringType') return resolvedStringSchema;
        if (ref === '#/$defs/numberType') return resolvedNumberSchema;
        return undefined;
      });

      const schema: UnknownSchema = {
        type: 'array',
        prefixItems: [
          { $ref: '#/$defs/stringType' },
          { $ref: '#/$defs/numberType' },
        ],
        $defs: {
          stringType: resolvedStringSchema,
          numberType: resolvedNumberSchema,
        },
      };

      const scanner = new JsonSchemaScanner({
        visitor,
        options: { resolveReference },
      });
      scanner.scan(schema);

      // Check that resolveReference was called for prefixItems $ref
      expect(resolveReference).toHaveBeenCalledWith(
        '#/$defs/stringType',
        expect.objectContaining({
          path: `${JSONPointer.Fragment}/prefixItems/0`,
          dataPath: `/0`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 0,
          referenceResolved: true,
          referencePath: '#/$defs/stringType',
        }),
        undefined,
      );

      expect(resolveReference).toHaveBeenCalledWith(
        '#/$defs/numberType',
        expect.objectContaining({
          path: `${JSONPointer.Fragment}/prefixItems/1`,
          dataPath: `/1`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 1,
          referenceResolved: true,
          referencePath: '#/$defs/numberType',
        }),
        undefined,
      );

      // Check that resolved schemas are visited
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: resolvedStringSchema,
          path: `${JSONPointer.Fragment}/prefixItems/0`,
          dataPath: `/0`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 0,
          referenceResolved: true,
          referencePath: '#/$defs/stringType',
        },
        undefined,
      );

      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: resolvedNumberSchema,
          path: `${JSONPointer.Fragment}/prefixItems/1`,
          dataPath: `/1`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 1,
          referenceResolved: true,
          referencePath: '#/$defs/numberType',
        },
        undefined,
      );
    });

    it('should handle prefixItems with nested object schemas containing $ref', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const resolvedAddressSchema = {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
        },
      };

      const resolveReference = vi.fn().mockImplementation((ref: string) => {
        if (ref === '#/$defs/address') return resolvedAddressSchema;
        return undefined;
      });

      const schema: UnknownSchema = {
        type: 'array',
        prefixItems: [
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { $ref: '#/$defs/address' },
            },
          },
        ],
        $defs: {
          address: resolvedAddressSchema,
        },
      };

      const scanner = new JsonSchemaScanner({
        visitor,
        options: { resolveReference },
      });
      scanner.scan(schema);

      // Check nested object in prefixItems[0] is visited
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.prefixItems[0],
          path: `${JSONPointer.Fragment}/prefixItems/0`,
          dataPath: `/0`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 0,
        },
        undefined,
      );

      // Check nested properties are visited
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: { type: 'string' },
          path: `${JSONPointer.Fragment}/prefixItems/0/properties/name`,
          dataPath: `/0/name`,
          depth: 2,
          keyword: 'properties',
          variant: 'name',
        },
        undefined,
      );

      // Check $ref inside prefixItems is resolved
      expect(resolveReference).toHaveBeenCalledWith(
        '#/$defs/address',
        expect.objectContaining({
          path: `${JSONPointer.Fragment}/prefixItems/0/properties/address`,
          dataPath: `/0/address`,
          depth: 2,
          keyword: 'properties',
          variant: 'address',
        }),
        undefined,
      );
    });

    it('should handle both prefixItems and items together', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const schema: UnknownSchema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' },
      };

      const scanner = new JsonSchemaScanner({ visitor });
      scanner.scan(schema);

      // Check prefixItems visits
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.prefixItems[0],
          path: `${JSONPointer.Fragment}/prefixItems/0`,
          dataPath: `/0`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 0,
        },
        undefined,
      );

      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.prefixItems[1],
          path: `${JSONPointer.Fragment}/prefixItems/1`,
          dataPath: `/1`,
          depth: 1,
          keyword: 'prefixItems',
          variant: 1,
        },
        undefined,
      );

      // Check items visit (for additional items beyond prefixItems)
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.items,
          path: `${JSONPointer.Fragment}/items`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'items',
        },
        undefined,
      );
    });

    it('should handle prefixItems with definitions references', () => {
      const visitor = {
        enter: vi.fn(),
        exit: vi.fn(),
      };

      const userSchema = {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      };

      const productSchema = {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          price: { type: 'number' },
        },
      };

      const resolveReference = vi.fn().mockImplementation((ref: string) => {
        if (ref === '#/definitions/user') return userSchema;
        if (ref === '#/definitions/product') return productSchema;
        return undefined;
      });

      const schema: UnknownSchema = {
        type: 'array',
        prefixItems: [
          { $ref: '#/definitions/user' },
          { $ref: '#/definitions/product' },
        ],
        definitions: {
          user: userSchema,
          product: productSchema,
        },
      };

      const scanner = new JsonSchemaScanner({
        visitor,
        options: { resolveReference },
      });
      scanner.scan(schema);

      // Verify $ref resolution for definitions
      expect(resolveReference).toHaveBeenCalledWith(
        '#/definitions/user',
        expect.objectContaining({
          path: `${JSONPointer.Fragment}/prefixItems/0`,
          keyword: 'prefixItems',
          variant: 0,
        }),
        undefined,
      );

      expect(resolveReference).toHaveBeenCalledWith(
        '#/definitions/product',
        expect.objectContaining({
          path: `${JSONPointer.Fragment}/prefixItems/1`,
          keyword: 'prefixItems',
          variant: 1,
        }),
        undefined,
      );

      // Verify resolved schema properties are visited
      expect(visitor.enter).toHaveBeenCalledWith(
        expect.objectContaining({
          schema: { type: 'number' },
          path: `${JSONPointer.Fragment}/prefixItems/0/properties/id`,
          dataPath: `/0/id`,
          depth: 2,
          keyword: 'properties',
          variant: 'id',
        }),
        undefined,
      );

      expect(visitor.enter).toHaveBeenCalledWith(
        expect.objectContaining({
          schema: { type: 'string' },
          path: `${JSONPointer.Fragment}/prefixItems/1/properties/sku`,
          dataPath: `/1/sku`,
          depth: 2,
          keyword: 'properties',
          variant: 'sku',
        }),
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
          path: `${JSONPointer.Fragment}/definitions/stringType`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: 'definitions',
          variant: 'stringType',
        },
        undefined,
      );
      expect(visitor.enter).toHaveBeenCalledWith(
        {
          schema: schema.$defs.numberType,
          path: `${JSONPointer.Fragment}/$defs/numberType`,
          dataPath: JSONPointer.Root,
          depth: 1,
          keyword: '$defs',
          variant: 'numberType',
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
          path: JSONPointer.Fragment,
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
          path === JSONPointer.Fragment,
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
        path: JSONPointer.Fragment,
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
        path: JSONPointer.Fragment,
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
        path: JSONPointer.Fragment,
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

describe('prefixItems $ref 참조 스키마 처리 테스트', () => {
  it('prefixItems에서 $ref로 $defs 스키마 참조 처리', () => {
    const jsonSchema = prefixItemsWithDefsSchema;

    const defs = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    }).scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/StringType',
        {
          type: 'string',
          minLength: 1,
        },
      ],
      [
        '#/$defs/NumberType',
        {
          type: 'number',
          minimum: 0,
        },
      ],
      [
        '#/$defs/BooleanType',
        {
          type: 'boolean',
        },
      ],
    ]);

    const finalSchema = new JsonSchemaScanner({
      options: {
        resolveReference: (path) => defs.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();

    expect(finalSchema).toEqual({
      title: 'Tuple with $defs',
      type: 'array',
      prefixItems: [
        {
          type: 'string',
          minLength: 1,
        },
        {
          type: 'number',
          minimum: 0,
        },
        {
          type: 'boolean',
        },
      ],
      $defs: {
        StringType: {
          type: 'string',
          minLength: 1,
        },
        NumberType: {
          type: 'number',
          minimum: 0,
        },
        BooleanType: {
          type: 'boolean',
        },
      },
    });
  });

  it('prefixItems에서 중첩 객체와 $ref 참조 처리', () => {
    const jsonSchema = prefixItemsWithNestedRefSchema;

    const defs = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    }).scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/Address',
        {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
          required: ['street', 'city'],
        },
      ],
      [
        '#/$defs/Person',
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { $ref: '#/$defs/Address' },
          },
          required: ['name'],
        },
      ],
    ]);

    const finalSchema = new JsonSchemaScanner({
      options: {
        resolveReference: (path) => defs.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();

    expect(finalSchema).toEqual({
      title: 'Tuple with nested refs',
      type: 'array',
      prefixItems: [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
              },
              required: ['street', 'city'],
            },
          },
          required: ['name'],
        },
        {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
          required: ['street', 'city'],
        },
      ],
      $defs: {
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
          required: ['street', 'city'],
        },
        Person: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { $ref: '#/$defs/Address' },
          },
          required: ['name'],
        },
      },
    });
  });

  it('prefixItems에서 순환 참조가 있는 스키마 처리 (무한 루프 방지)', () => {
    const jsonSchema = prefixItemsWithRecursiveSchema;

    const defs = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    }).scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/TreeNode',
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/$defs/TreeNode' },
            },
          },
          required: ['id'],
        },
      ],
    ]);

    const finalSchema = new JsonSchemaScanner({
      options: {
        resolveReference: (path) => defs.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();

    expect(finalSchema).toEqual({
      title: 'Tuple with recursive ref',
      type: 'array',
      prefixItems: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/$defs/TreeNode' },
            },
          },
          required: ['id'],
        },
      ],
      items: false,
      $defs: {
        TreeNode: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/$defs/TreeNode' },
            },
          },
          required: ['id'],
        },
      },
    });
  });

  it('prefixItems와 items를 함께 사용하며 $ref 참조 처리', () => {
    const jsonSchema = prefixItemsWithItemsAndRefSchema;

    const defs = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    }).scan(jsonSchema);

    // prefixItems가 items보다 먼저 스캔됨 (JSON Schema Draft 2020-12 순서)
    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/Header',
        {
          type: 'object',
          properties: {
            version: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      ],
      [
        '#/$defs/DataItem',
        {
          type: 'object',
          properties: {
            id: { type: 'number' },
            value: { type: 'string' },
          },
        },
      ],
    ]);

    const finalSchema = new JsonSchemaScanner({
      options: {
        resolveReference: (path) => defs.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();

    expect(finalSchema).toEqual({
      title: 'Data array with header',
      type: 'array',
      prefixItems: [
        {
          type: 'object',
          properties: {
            version: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      ],
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          value: { type: 'string' },
        },
      },
      $defs: {
        Header: {
          type: 'object',
          properties: {
            version: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        DataItem: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            value: { type: 'string' },
          },
        },
      },
    });
  });

  it('prefixItems에서 definitions(Draft-07 스타일) 참조 처리', () => {
    const jsonSchema = prefixItemsWithDefinitionsSchema;

    const defs = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    }).scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/definitions/Latitude',
        {
          type: 'number',
          minimum: -90,
          maximum: 90,
        },
      ],
      [
        '#/definitions/Longitude',
        {
          type: 'number',
          minimum: -180,
          maximum: 180,
        },
      ],
    ]);

    const finalSchema = new JsonSchemaScanner({
      options: {
        resolveReference: (path) => defs.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();

    expect(finalSchema).toEqual({
      title: 'Coordinate tuple',
      type: 'array',
      prefixItems: [
        {
          type: 'number',
          minimum: -90,
          maximum: 90,
        },
        {
          type: 'number',
          minimum: -180,
          maximum: 180,
        },
      ],
      items: false,
      definitions: {
        Latitude: {
          type: 'number',
          minimum: -90,
          maximum: 90,
        },
        Longitude: {
          type: 'number',
          minimum: -180,
          maximum: 180,
        },
      },
    });
  });
});

// Test schemas for prefixItems $ref tests
const prefixItemsWithDefsSchema = {
  title: 'Tuple with $defs',
  type: 'array',
  prefixItems: [
    { $ref: '#/$defs/StringType' },
    { $ref: '#/$defs/NumberType' },
    { $ref: '#/$defs/BooleanType' },
  ],
  $defs: {
    StringType: {
      type: 'string',
      minLength: 1,
    },
    NumberType: {
      type: 'number',
      minimum: 0,
    },
    BooleanType: {
      type: 'boolean',
    },
  },
};

const prefixItemsWithNestedRefSchema = {
  title: 'Tuple with nested refs',
  type: 'array',
  prefixItems: [{ $ref: '#/$defs/Person' }, { $ref: '#/$defs/Address' }],
  $defs: {
    Address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
      },
      required: ['street', 'city'],
    },
    Person: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { $ref: '#/$defs/Address' },
      },
      required: ['name'],
    },
  },
};

const prefixItemsWithRecursiveSchema = {
  title: 'Tuple with recursive ref',
  type: 'array',
  prefixItems: [{ type: 'string' }, { $ref: '#/$defs/TreeNode' }],
  items: false,
  $defs: {
    TreeNode: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        children: {
          type: 'array',
          items: { $ref: '#/$defs/TreeNode' },
        },
      },
      required: ['id'],
    },
  },
};

const prefixItemsWithItemsAndRefSchema = {
  title: 'Data array with header',
  type: 'array',
  prefixItems: [{ $ref: '#/$defs/Header' }],
  items: { $ref: '#/$defs/DataItem' },
  $defs: {
    Header: {
      type: 'object',
      properties: {
        version: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
    DataItem: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        value: { type: 'string' },
      },
    },
  },
};

const prefixItemsWithDefinitionsSchema = {
  title: 'Coordinate tuple',
  type: 'array',
  prefixItems: [
    { $ref: '#/definitions/Latitude' },
    { $ref: '#/definitions/Longitude' },
  ],
  items: false,
  definitions: {
    Latitude: {
      type: 'number',
      minimum: -90,
      maximum: 90,
    },
    Longitude: {
      type: 'number',
      minimum: -180,
      maximum: 180,
    },
  },
};
