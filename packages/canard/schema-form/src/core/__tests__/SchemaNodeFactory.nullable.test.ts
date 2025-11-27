import { describe, expect, it } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  JsonSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import { ArrayNode } from '../nodes/ArrayNode';
import { BooleanNode } from '../nodes/BooleanNode';
import { NullNode } from '../nodes/NullNode';
import { NumberNode } from '../nodes/NumberNode';
import { ObjectNode } from '../nodes/ObjectNode';
import { StringNode } from '../nodes/StringNode';

describe('SchemaNodeFactory - Nullable Type Handling', () => {
  describe('nullable property extraction from array syntax', () => {
    it('should correctly extract nullable from string type array syntax', () => {
      const schema = {
        type: ['string', 'null'],
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('string');
    });

    it('should correctly extract nullable from number type array syntax', () => {
      const schema = {
        type: ['number', 'null'],
      } as unknown as NumberSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(NumberNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('number');
    });

    it('should correctly extract nullable from integer type array syntax', () => {
      const schema = {
        type: ['integer', 'null'],
      } as unknown as NumberSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(NumberNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('integer');
    });

    it('should correctly extract nullable from boolean type array syntax', () => {
      const schema = {
        type: ['boolean', 'null'],
      } as unknown as BooleanSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(BooleanNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('boolean');
    });

    it('should correctly extract nullable from object type array syntax', () => {
      const schema = {
        type: ['object', 'null'],
        properties: {
          name: { type: 'string' },
        },
      } as unknown as ObjectSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ObjectNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('object');
    });

    it('should correctly extract nullable from array type array syntax', () => {
      const schema = {
        type: ['array', 'null'],
        items: { type: 'string' },
      } as unknown as ArraySchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ArrayNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('array');
    });
  });

  describe('null position independence', () => {
    it('should handle null as first element in type array', () => {
      const schema = {
        type: ['null', 'string'],
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('string');
    });

    it('should handle null as second element in type array', () => {
      const schema = {
        type: ['string', 'null'],
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('string');
    });

    it('should produce identical nodes regardless of null position', () => {
      const schema1 = {
        type: ['null', 'number'],
        minimum: 0,
      } as unknown as NumberSchema;

      const schema2 = {
        type: ['number', 'null'],
        minimum: 0,
      } as unknown as NumberSchema;

      const node1 = nodeFromJsonSchema({
        jsonSchema: schema1,
        onChange: () => {},
      });

      const node2 = nodeFromJsonSchema({
        jsonSchema: schema2,
        onChange: () => {},
      });

      expect(node1.nullable).toBe(node2.nullable);
      expect(node1.schemaType).toBe(node2.schemaType);
      expect(node1).toBeInstanceOf(NumberNode);
      expect(node2).toBeInstanceOf(NumberNode);
    });
  });

  describe('non-nullable types', () => {
    it('should correctly identify non-nullable string type', () => {
      const schema: StringSchema = { type: 'string' };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(false);
      expect(node.schemaType).toBe('string');
    });

    it('should correctly identify non-nullable number type', () => {
      const schema: NumberSchema = { type: 'number' };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(NumberNode);
      expect(node.nullable).toBe(false);
      expect(node.schemaType).toBe('number');
    });

    it('should correctly identify non-nullable boolean type', () => {
      const schema: BooleanSchema = { type: 'boolean' };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(BooleanNode);
      expect(node.nullable).toBe(false);
      expect(node.schemaType).toBe('boolean');
    });

    it('should correctly identify non-nullable object type', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ObjectNode);
      expect(node.nullable).toBe(false);
      expect(node.schemaType).toBe('object');
    });

    it('should correctly identify non-nullable array type', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: { type: 'string' },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ArrayNode);
      expect(node.nullable).toBe(false);
      expect(node.schemaType).toBe('array');
    });
  });

  describe('pure null type', () => {
    it('should create NullNode for pure null type', () => {
      const schema: JsonSchema = { type: 'null' };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(NullNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('null');
    });

    it('should create NullNode for single-element null array', () => {
      const schema = { type: ['null'] } as unknown as JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(NullNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('null');
    });
  });

  describe('complex nullable schemas', () => {
    it('should handle nullable object with nested properties', () => {
      const schema = {
        type: ['object', 'null'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: {
            type: ['string', 'null'],
            format: 'email',
          },
        },
        required: ['name'],
      } as unknown as ObjectSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ObjectNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('object');
    });

    it('should handle nullable array with complex items', () => {
      const schema = {
        type: ['array', 'null'],
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
      } as unknown as ArraySchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ArrayNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('array');
    });

    it('should handle nullable string with format and constraints', () => {
      const schema = {
        type: ['string', 'null'],
        format: 'email',
        minLength: 5,
        maxLength: 100,
        pattern: '^[a-z]+@[a-z]+\\.[a-z]+$',
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('string');
    });

    it('should handle nullable number with range constraints', () => {
      const schema = {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
        exclusiveMinimum: false,
      } as unknown as NumberSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(NumberNode);
      expect(node.nullable).toBe(true);
      expect(node.schemaType).toBe('number');
    });
  });

  describe('edge cases and validation', () => {
    it('should handle nullable type with default value', () => {
      const schema = {
        type: ['string', 'null'],
        default: null,
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
      expect(node.value).toBe(null);
    });

    it('should handle nullable type with non-null default value', () => {
      const schema = {
        type: ['string', 'null'],
        default: 'default value',
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
      expect(node.value).toBe('default value');
    });

    it('should handle nullable enum pattern', () => {
      const schema = {
        type: ['string', 'null'],
        enum: ['option1', 'option2', null],
      } as unknown as StringSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(StringNode);
      expect(node.nullable).toBe(true);
    });

    it('should correctly route integer type to NumberNode', () => {
      const integerSchema = {
        type: ['integer', 'null'],
        minimum: 0,
      } as unknown as NumberSchema;

      const numberSchema = {
        type: ['number', 'null'],
        minimum: 0,
      } as unknown as NumberSchema;

      const integerNode = nodeFromJsonSchema({
        jsonSchema: integerSchema,
        onChange: () => {},
      });

      const numberNode = nodeFromJsonSchema({
        jsonSchema: numberSchema,
        onChange: () => {},
      });

      // Both should create NumberNode instances
      expect(integerNode).toBeInstanceOf(NumberNode);
      expect(numberNode).toBeInstanceOf(NumberNode);

      // But with different schemaType
      expect(integerNode.schemaType).toBe('integer');
      expect(numberNode.schemaType).toBe('number');

      // Both nullable
      expect(integerNode.nullable).toBe(true);
      expect(numberNode.nullable).toBe(true);
    });
  });

  describe('nested nullable handling', () => {
    it('should handle object with nullable nested object', () => {
      const schema = {
        type: 'object',
        properties: {
          address: {
            type: ['object', 'null'],
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
            },
          },
        },
      } as unknown as ObjectSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ObjectNode);
      expect(node.nullable).toBe(false);

      const addressNode = node.find('./address');
      expect(addressNode).toBeInstanceOf(ObjectNode);
      expect(addressNode?.nullable).toBe(true);
    });

    it('should handle array with nullable items', () => {
      const schema = {
        type: 'array',
        items: {
          type: ['string', 'null'],
        },
      } as unknown as ArraySchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ArrayNode);
      expect(node.nullable).toBe(false);

      // Items should be nullable
      const arrayNode = node as ArrayNode;
      const itemsSchema = arrayNode.jsonSchema.items;
      expect(itemsSchema?.type).toEqual(['string', 'null']);
    });

    it('should handle deeply nested nullable types', () => {
      const schema = {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              nested: {
                type: ['object', 'null'],
                properties: {
                  value: {
                    type: ['string', 'null'],
                  },
                },
              },
            },
          },
        },
      } as unknown as ObjectSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(node).toBeInstanceOf(ObjectNode);

      const nestedNode = node.find('./data/nested');
      expect(nestedNode?.nullable).toBe(true);

      const valueNode = node.find('./data/nested/value');
      expect(valueNode?.nullable).toBe(true);
    });
  });

  describe('consistency validation', () => {
    it('should produce consistent nullable flags for equivalent schemas', () => {
      const schemas = [
        { type: ['string', 'null'] },
        { type: ['null', 'string'] },
      ] as unknown as StringSchema[];

      const nodes = schemas.map((schema) =>
        nodeFromJsonSchema({
          jsonSchema: schema,
          onChange: () => {},
        }),
      );

      // All nodes should have identical nullable flags
      const nullableFlags = nodes.map((node) => node.nullable);
      expect(nullableFlags.every((flag) => flag === true)).toBe(true);

      // All nodes should be StringNode
      expect(nodes.every((node) => node instanceof StringNode)).toBe(true);
    });

    it('should distinguish nullable from non-nullable of same base type', () => {
      const nullableSchema = {
        type: ['number', 'null'],
      } as unknown as NumberSchema;
      const nonNullableSchema: NumberSchema = { type: 'number' };

      const nullableNode = nodeFromJsonSchema({
        jsonSchema: nullableSchema,
        onChange: () => {},
      });

      const nonNullableNode = nodeFromJsonSchema({
        jsonSchema: nonNullableSchema,
        onChange: () => {},
      });

      expect(nullableNode.nullable).toBe(true);
      expect(nonNullableNode.nullable).toBe(false);

      // But same base type
      expect(nullableNode.schemaType).toBe(nonNullableNode.schemaType);
      expect(nullableNode).toBeInstanceOf(NumberNode);
      expect(nonNullableNode).toBeInstanceOf(NumberNode);
    });
  });
});
