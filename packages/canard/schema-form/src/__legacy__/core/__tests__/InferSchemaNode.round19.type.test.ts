import { describe, expectTypeOf, it } from 'vitest';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { NullNode } from '../nodes/NullNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import type { InferSchemaNode, SchemaNode } from '../../../core/types';

// filid:contract public-node-inference
describe('NODE-059 public node inference', () => {
  it('narrows inline object and array branches', () => {
    expectTypeOf<
      InferSchemaNode<{
        oneOf: [{ type: 'object' }, { type: 'object' }];
      }>
    >().toEqualTypeOf<ObjectNode>();
    expectTypeOf<
      InferSchemaNode<{
        anyOf: [{ type: 'array' }, { type: 'array' }];
      }>
    >().toEqualTypeOf<ArrayNode>();
  });

  it('keeps an explicit null branch inside an object variant', () => {
    expectTypeOf<
      InferSchemaNode<{
        oneOf: [{ type: 'object' }, { type: 'null' }];
      }>
    >().toEqualTypeOf<ObjectNode>();
  });

  it('keeps references, gates, dual keywords and host allOf broad', () => {
    expectTypeOf<
      InferSchemaNode<{
        oneOf: [{ type: 'object' }, { $ref: '#/$defs/other' }];
      }>
    >().toEqualTypeOf<SchemaNode>();
    expectTypeOf<
      InferSchemaNode<{
        anyOf: [
          { type: 'object'; controls: { active: true } },
          { type: 'object' },
        ];
      }>
    >().toEqualTypeOf<SchemaNode>();
    expectTypeOf<
      InferSchemaNode<{
        controls: { discriminator: 'kind' };
        oneOf: [{ type: 'object' }, { type: 'object' }];
      }>
    >().toEqualTypeOf<SchemaNode>();
    expectTypeOf<
      InferSchemaNode<{
        oneOf: [{ type: 'object' }];
        anyOf: [{ type: 'object' }];
      }>
    >().toEqualTypeOf<SchemaNode>();
    expectTypeOf<
      InferSchemaNode<{
        allOf: [{ properties: { id: { type: 'string' } } }];
        oneOf: [{ type: 'object' }];
      }>
    >().toEqualTypeOf<SchemaNode>();
  });

  it('maps unbranched primitive literals to their node kind', () => {
    expectTypeOf<InferSchemaNode<{ const: 42 }>>().toEqualTypeOf<NumberNode>();
    expectTypeOf<
      InferSchemaNode<{ enum: readonly ['cat', 'dog', null] }>
    >().toEqualTypeOf<StringNode>();
    expectTypeOf<InferSchemaNode<{ const: null }>>().toEqualTypeOf<NullNode>();
  });

  it('marks statically rejected literals and mixed container branches as invalid', () => {
    expectTypeOf<InferSchemaNode<{ const: { id: 1 } }>>().toBeNever();
    expectTypeOf<InferSchemaNode<{ const: [] }>>().toBeNever();
    expectTypeOf<
      InferSchemaNode<{ enum: readonly ['cat', 1] }>
    >().toBeNever();
    expectTypeOf<
      InferSchemaNode<{
        oneOf: [{ type: 'object' }, { type: 'array' }];
      }>
    >().toBeNever();
  });
});
