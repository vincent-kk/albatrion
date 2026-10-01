import { describe, expect, expectTypeOf, it } from 'vitest';

import { isObjectNode, isTerminalNode } from '../index';
import type { ArrayNode, FormTypeInputProps, InferSchemaNode, NullNode, NumberNode, ObjectNode,
  SchemaNode, StringNode, TerminalNode, UnionNode } from '../index';

type PublicKeys = 'type' | 'strategy' | 'schemaType' | 'jsonSchema' |
  'required' | 'nullable' | 'depth' | 'isRoot' | 'rootNode' | 'parentNode' |
  'name' | 'escapedName' | 'path' | 'children' | 'raw' | 'extras' |
  'value' | 'outputValue' | 'inactiveValues' | 'active' | 'visible' | 'enabled' |
  'readOnly' | 'disabled' | 'watchValues' | 'context' | 'typeMismatch' |
  'typeMismatches' | 'diagnostics' | 'defaultValue' | 'find' | 'findNodes' |
  'setValue' | 'resetSubtree';

describe('new SchemaNode public types', () => {
  it('TEST-069 public type keys include the context getter', () => {
    expectTypeOf<keyof SchemaNode>().toEqualTypeOf<PublicKeys>();
  });

  it('narrows kinds, schemaType, and terminal object strategy', () => {
    expectTypeOf<Extract<SchemaNode, { type: 'string' }>>()
      .toEqualTypeOf<StringNode>();
    expectTypeOf<NumberNode['schemaType']>()
      .toEqualTypeOf<'number' | 'integer'>();
    expectTypeOf<Extract<TerminalNode, { type: 'object' }>['children']>()
      .toEqualTypeOf<null>();
    expectTypeOf<Extract<ObjectNode, { strategy: 'branch' }>['children']>()
      .toEqualTypeOf<readonly SchemaNode[]>();
    const checkTerminalObject = (node: SchemaNode) => {
      if (isTerminalNode(node) && isObjectNode(node))
        expectTypeOf(node.children).toEqualTypeOf<null>();
    };
    expect(checkTerminalObject).toBeTypeOf('function');
  });

  it('TEST-070 keeps structural verbs on both array strategies', () => {
    expectTypeOf<ArrayNode<string>['push']>().toEqualTypeOf<(value?: string) => number>();
    expectTypeOf<ArrayNode<string>['pop']>().toEqualTypeOf<() => string | undefined>();
    expectTypeOf<ArrayNode<string>['update']>()
      .toEqualTypeOf<(index: number, value: string) => string | undefined>();
    expectTypeOf<ArrayNode<string>['remove']>()
      .toEqualTypeOf<(index: number) => string | undefined>();
    expectTypeOf<ArrayNode<string>['clear']>().toEqualTypeOf<() => void>();
    expectTypeOf<'push' extends keyof StringNode ? true : false>().toEqualTypeOf<false>();
  });

  it('splits union values by mismatch without widening onChange', () => {
    type Types = readonly ['string', 'number'];
    type Matching = Extract<UnionNode<Types, false>, { typeMismatch: false }>;
    type Mismatched = Extract<UnionNode<Types, false>, { typeMismatch: true }>;
    expectTypeOf<Matching['value']>().toEqualTypeOf<string | number | undefined>();
    expectTypeOf<Mismatched['value']>().toEqualTypeOf<unknown>();
    expectTypeOf<Parameters<FormTypeInputProps<Types, false>['onChange']>[0]>()
      .toEqualTypeOf<string | number | undefined>();
    expectTypeOf<Parameters<FormTypeInputProps<Types, true>['onChange']>[0]>()
      .toEqualTypeOf<string | number | null | undefined>();
  });

  it('maps static schemas and keeps dynamic references broad', () => {
    expectTypeOf<InferSchemaNode<{ type: 'integer' }>>().toEqualTypeOf<NumberNode>();
    expectTypeOf<InferSchemaNode<{ type: string }>>().toEqualTypeOf<SchemaNode>();
    expectTypeOf<InferSchemaNode<{ type: readonly string[] }>>()
      .toEqualTypeOf<SchemaNode>();
    expectTypeOf<InferSchemaNode<{ type: readonly ['string', 'number'] }>>()
      .toEqualTypeOf<UnionNode<readonly ['string', 'number'], false>>();
    expectTypeOf<InferSchemaNode<{ type: readonly ['string', 'number', 'null'] }>>()
      .toEqualTypeOf<UnionNode<readonly ['string', 'number'], true>>();
    expectTypeOf<InferSchemaNode<{ type: readonly ['null', 'null'] }>>()
      .toEqualTypeOf<NullNode>();
    expectTypeOf<InferSchemaNode<{ $ref: '#/$defs/value' }>>()
      .toEqualTypeOf<SchemaNode>();
    expectTypeOf<InferSchemaNode<{ type: 'string'; $ref: '#/$defs/value' }>>()
      .toEqualTypeOf<SchemaNode>();
    expectTypeOf<InferSchemaNode<{ type: 'string'; controls: { active: './flag' } }>>()
      .toEqualTypeOf<SchemaNode>();
    expectTypeOf<InferSchemaNode<{ oneOf: readonly [
      { type: 'object' }, { type: 'object' }] }>>()
      .toEqualTypeOf<ObjectNode>();
    expectTypeOf<InferSchemaNode<{ oneOf: readonly [
      { type: readonly ['object', 'null'] }, { type: 'object' }] }>>()
      .toEqualTypeOf<ObjectNode>();
    expectTypeOf<InferSchemaNode<{ oneOf: readonly [
      { type: 'object' }, { type: 'array' }] }>>()
      .toEqualTypeOf<never>();
    expectTypeOf<InferSchemaNode<{ enum: readonly [undefined] }>>()
      .toEqualTypeOf<never>();
    expectTypeOf<InferSchemaNode<false>>().toEqualTypeOf<never>();
  });
});
