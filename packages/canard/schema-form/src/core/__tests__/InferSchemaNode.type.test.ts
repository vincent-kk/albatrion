import { describe, expectTypeOf, it } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  NullSchema,
  NullableArraySchema,
  NullableBooleanSchema,
  NullableNumberSchema,
  NullableObjectSchema,
  NullableStringSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { BooleanNode } from '../nodes/BooleanNode';
import type { NullNode } from '../nodes/NullNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import type { VirtualNode } from '../nodes/VirtualNode';
import type { InferSchemaNode, SchemaNode } from '../nodes/type';

describe('InferSchemaNode type inference tests', () => {
  describe('Non-nullable schemas', () => {
    it('NumberSchema → NumberNode', () => {
      expectTypeOf<InferSchemaNode<NumberSchema>>().toEqualTypeOf<NumberNode>();
    });

    it('StringSchema → StringNode', () => {
      expectTypeOf<InferSchemaNode<StringSchema>>().toEqualTypeOf<StringNode>();
    });

    it('BooleanSchema → BooleanNode', () => {
      expectTypeOf<
        InferSchemaNode<BooleanSchema>
      >().toEqualTypeOf<BooleanNode>();
    });

    it('ArraySchema → ArrayNode', () => {
      expectTypeOf<InferSchemaNode<ArraySchema>>().toEqualTypeOf<ArrayNode>();
    });

    it('ObjectSchema → ObjectNode', () => {
      expectTypeOf<InferSchemaNode<ObjectSchema>>().toEqualTypeOf<ObjectNode>();
    });

    it('VirtualSchema → VirtualNode', () => {
      expectTypeOf<
        InferSchemaNode<VirtualSchema>
      >().toEqualTypeOf<VirtualNode>();
    });

    it('NullSchema → NullNode', () => {
      expectTypeOf<InferSchemaNode<NullSchema>>().toEqualTypeOf<NullNode>();
    });
  });

  describe('Nullable schemas', () => {
    it('NumberNullableSchema → NumberNode', () => {
      expectTypeOf<
        InferSchemaNode<NullableNumberSchema>
      >().toEqualTypeOf<NumberNode>();
    });

    it('StringNullableSchema → StringNode', () => {
      expectTypeOf<
        InferSchemaNode<NullableStringSchema>
      >().toEqualTypeOf<StringNode>();
    });

    it('BooleanNullableSchema → BooleanNode', () => {
      expectTypeOf<
        InferSchemaNode<NullableBooleanSchema>
      >().toEqualTypeOf<BooleanNode>();
    });

    it('ArrayNullableSchema → ArrayNode', () => {
      expectTypeOf<
        InferSchemaNode<NullableArraySchema>
      >().toEqualTypeOf<ArrayNode>();
    });

    it('ObjectNullableSchema → ObjectNode', () => {
      expectTypeOf<
        InferSchemaNode<NullableObjectSchema>
      >().toEqualTypeOf<ObjectNode>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → SchemaNode', () => {
      expectTypeOf<InferSchemaNode<unknown>>().toEqualTypeOf<SchemaNode>();
    });

    it('any → SchemaNode', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expectTypeOf<InferSchemaNode<any>>().toEqualTypeOf<SchemaNode>();
    });
  });

  describe('Const schema literal tests (mutable tuple)', () => {
    it('number type schema literal → NumberNode', () => {
      type Schema = { type: 'number' };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<NumberNode>();
    });

    it('nullable number type schema literal → NumberNode', () => {
      type Schema = { type: ['number', 'null'] };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<NumberNode>();
    });

    it('string type schema literal → StringNode', () => {
      type Schema = { type: 'string' };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<StringNode>();
    });

    it('nullable string type schema literal → StringNode', () => {
      type Schema = { type: ['string', 'null'] };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<StringNode>();
    });

    it('boolean type schema literal → BooleanNode', () => {
      type Schema = { type: 'boolean' };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<BooleanNode>();
    });

    it('nullable boolean type schema literal → BooleanNode', () => {
      type Schema = { type: ['boolean', 'null'] };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<BooleanNode>();
    });

    it('array type schema literal → ArrayNode', () => {
      type Schema = { type: 'array'; items: { type: 'string' } };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<ArrayNode>();
    });

    it('nullable array type schema literal → ArrayNode', () => {
      type Schema = {
        type: ['array', 'null'];
        items: { type: 'string' };
      };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<ArrayNode>();
    });

    it('object type schema literal → ObjectNode', () => {
      type Schema = {
        type: 'object';
        properties: { name: { type: 'string' } };
      };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<ObjectNode>();
    });

    it('nullable object type schema literal → ObjectNode', () => {
      type Schema = {
        type: ['object', 'null'];
        properties: { name: { type: 'string' } };
      };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<ObjectNode>();
    });

    it('null type schema literal → NullNode', () => {
      type Schema = { type: 'null' };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<NullNode>();
    });

    it('virtual type schema literal → VirtualNode', () => {
      type Schema = { type: 'virtual' };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<VirtualNode>();
    });
  });

  describe('Const schema literal tests (readonly tuple - with as const)', () => {
    it('nullable number type with readonly → NumberNode', () => {
      type Schema = { type: readonly ['number', 'null'] };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<NumberNode>();
    });

    it('nullable string type with readonly → StringNode', () => {
      type Schema = { type: readonly ['string', 'null'] };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<StringNode>();
    });

    it('nullable boolean type with readonly → BooleanNode', () => {
      type Schema = { type: readonly ['boolean', 'null'] };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<BooleanNode>();
    });

    it('nullable array type with readonly → ArrayNode', () => {
      type Schema = {
        type: readonly ['array', 'null'];
        items: { type: 'string' };
      };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<ArrayNode>();
    });

    it('nullable object type with readonly → ObjectNode', () => {
      type Schema = {
        type: readonly ['object', 'null'];
        properties: { name: { type: 'string' } };
      };
      expectTypeOf<InferSchemaNode<Schema>>().toEqualTypeOf<ObjectNode>();
    });
  });
});
