import { describe, expect, expectTypeOf, it } from 'vitest';

import type { FieldNodeListener } from '@/schema-form/core/engine';
import type { NodeStateFlags } from '@/schema-form/core/engine';
import type { ValidationIssue } from '@/schema-form/core/engine';
import type {
  FieldNodeEventType,
  FieldNodeRequestType,
} from '@/schema-form/core/engine';

import type {
  ArrayNode,
  FieldNode,
  FieldNodeInputProps,
  InferFieldNode,
  NullNode,
  NumberNode,
  ObjectNode,
  StringNode,
  TerminalNode,
  UnionNode,
} from '../type';
import { isObjectNode, isTerminalNode } from '../utils/guards';

type PublicKeys =
  | 'type'
  | 'strategy'
  | 'schemaType'
  | 'jsonSchema'
  | 'required'
  | 'nullable'
  | 'depth'
  | 'isRoot'
  | 'rootNode'
  | 'parentNode'
  | 'name'
  | 'escapedName'
  | 'path'
  | 'children'
  | 'raw'
  | 'undeclaredValues'
  | 'value'
  | 'outputValue'
  | 'inactiveValues'
  | 'active'
  | 'visible'
  | 'enabled'
  | 'readOnly'
  | 'disabled'
  | 'watchValues'
  | 'context'
  | 'misfit'
  | 'misfits'
  | 'diagnostics'
  | 'defaultValue'
  | 'find'
  | 'findNodes'
  | 'setValue'
  | 'resetSubtree'
  | 'state'
  | 'setState'
  | 'globalState'
  | 'setSubtreeState'
  | 'clearSubtreeState'
  | 'errors'
  | 'globalErrors'
  | 'setExternalErrors'
  | 'clearExternalErrors'
  | 'request'
  | 'subscribe'
  | 'revision'
  | 'validate'
  | 'batch'
  | 'visitSubtree';

describe('new FieldNode public types', () => {
  it('TEST-069 public type keys include the context getter', () => {
    expectTypeOf<keyof FieldNode>().toEqualTypeOf<PublicKeys>();
  });

  it('26C-01 PR-4 exposes event, state, validation, and batch signatures', () => {
    expectTypeOf<FieldNode['state']>().toEqualTypeOf<NodeStateFlags>();
    expectTypeOf<
      Parameters<FieldNode['setState']>[0]
    >().toEqualTypeOf<NodeStateFlags>();
    expectTypeOf<
      Parameters<FieldNode['setSubtreeState']>[0]
    >().toEqualTypeOf<NodeStateFlags>();
    expectTypeOf<
      ReturnType<FieldNode['clearSubtreeState']>
    >().toEqualTypeOf<void>();
    expectTypeOf<FieldNode['errors']>().toEqualTypeOf<
      readonly ValidationIssue[]
    >();
    expectTypeOf<FieldNode['globalErrors']>().toEqualTypeOf<
      readonly ValidationIssue[]
    >();
    expectTypeOf<Parameters<FieldNode['setExternalErrors']>[0]>().toEqualTypeOf<
      readonly ValidationIssue[]
    >();
    expectTypeOf<
      ReturnType<FieldNode['clearExternalErrors']>
    >().toEqualTypeOf<void>();
    expectTypeOf<
      Parameters<FieldNode['request']>[0]
    >().toEqualTypeOf<FieldNodeRequestType>();
    expectTypeOf<Parameters<FieldNode['revision']>[0]>().toEqualTypeOf<
      FieldNodeEventType | undefined
    >();
    expectTypeOf<ReturnType<FieldNode['revision']>>().toEqualTypeOf<number>();
    expectTypeOf<ReturnType<FieldNode['subscribe']>>().toEqualTypeOf<
      () => void
    >();
    expectTypeOf<
      Parameters<FieldNode['subscribe']>[0]
    >().toEqualTypeOf<FieldNodeListener>();
    expectTypeOf<ReturnType<FieldNode['validate']>>().toEqualTypeOf<
      Promise<readonly ValidationIssue[]>
    >();
    expectTypeOf<FieldNode['globalState']>().toEqualTypeOf<
      Readonly<Record<string, boolean | undefined>>
    >();
    expectTypeOf<Parameters<FieldNode['batch']>[0]>().toEqualTypeOf<
      () => void
    >();
  });

  it('narrows kinds, schemaType, and terminal object strategy', () => {
    expectTypeOf<
      Extract<FieldNode, { type: 'string' }>
    >().toEqualTypeOf<StringNode>();
    expectTypeOf<NumberNode['schemaType']>().toEqualTypeOf<
      'number' | 'integer'
    >();
    expectTypeOf<
      Extract<TerminalNode, { type: 'object' }>['children']
    >().toEqualTypeOf<null>();
    expectTypeOf<
      Extract<ObjectNode, { strategy: 'branch' }>['children']
    >().toEqualTypeOf<readonly FieldNode[]>();
    const checkTerminalObject = (node: FieldNode) => {
      if (isTerminalNode(node) && isObjectNode(node))
        expectTypeOf(node.children).toEqualTypeOf<null>();
    };
    expect(checkTerminalObject).toBeTypeOf('function');
  });

  it('TEST-070 keeps structural verbs on both array strategies', () => {
    expectTypeOf<ArrayNode<string>['push']>().toEqualTypeOf<
      (value?: string) => number
    >();
    expectTypeOf<ArrayNode<string>['pop']>().toEqualTypeOf<
      () => string | undefined
    >();
    expectTypeOf<ArrayNode<string>['update']>().toEqualTypeOf<
      (index: number, value: string) => string | undefined
    >();
    expectTypeOf<ArrayNode<string>['remove']>().toEqualTypeOf<
      (index: number) => string | undefined
    >();
    expectTypeOf<ArrayNode<string>['clear']>().toEqualTypeOf<() => void>();
    expectTypeOf<
      'push' extends keyof StringNode ? true : false
    >().toEqualTypeOf<false>();
  });

  it('splits union values by mismatch without widening onChange', () => {
    type Types = readonly ['string', 'number'];
    type Matching = Extract<UnionNode<Types, false>, { misfit: false }>;
    type MisfitNode = Extract<UnionNode<Types, false>, { misfit: true }>;
    expectTypeOf<Matching['value']>().toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf<MisfitNode['value']>().toEqualTypeOf<unknown>();
    expectTypeOf<
      Parameters<FieldNodeInputProps<Types, false>['onChange']>[0]
    >().toEqualTypeOf<string | number | undefined>();
    expectTypeOf<
      Parameters<FieldNodeInputProps<Types, true>['onChange']>[0]
    >().toEqualTypeOf<string | number | null | undefined>();
  });

  it('maps static schemas and keeps dynamic references broad', () => {
    expectTypeOf<
      InferFieldNode<{ type: 'integer' }>
    >().toEqualTypeOf<NumberNode>();
    expectTypeOf<InferFieldNode<{ type: string }>>().toEqualTypeOf<FieldNode>();
    expectTypeOf<
      InferFieldNode<{ type: readonly string[] }>
    >().toEqualTypeOf<FieldNode>();
    expectTypeOf<
      InferFieldNode<{ type: readonly ['string', 'number'] }>
    >().toEqualTypeOf<UnionNode<readonly ['string', 'number'], false>>();
    expectTypeOf<
      InferFieldNode<{ type: readonly ['string', 'number', 'null'] }>
    >().toEqualTypeOf<UnionNode<readonly ['string', 'number'], true>>();
    expectTypeOf<
      InferFieldNode<{ type: readonly ['null', 'null'] }>
    >().toEqualTypeOf<NullNode>();
    expectTypeOf<
      InferFieldNode<{ $ref: '#/$defs/value' }>
    >().toEqualTypeOf<FieldNode>();
    expectTypeOf<
      InferFieldNode<{ type: 'string'; $ref: '#/$defs/value' }>
    >().toEqualTypeOf<FieldNode>();
    expectTypeOf<
      InferFieldNode<{ type: 'string'; controls: { active: './flag' } }>
    >().toEqualTypeOf<FieldNode>();
    expectTypeOf<
      InferFieldNode<{
        oneOf: readonly [{ type: 'object' }, { type: 'object' }];
      }>
    >().toEqualTypeOf<ObjectNode>();
    expectTypeOf<
      InferFieldNode<{
        oneOf: readonly [
          { type: readonly ['object', 'null'] },
          { type: 'object' },
        ];
      }>
    >().toEqualTypeOf<ObjectNode>();
    expectTypeOf<
      InferFieldNode<{
        oneOf: readonly [{ type: 'object' }, { type: 'array' }];
      }>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      InferFieldNode<{ enum: readonly [undefined] }>
    >().toEqualTypeOf<never>();
    expectTypeOf<InferFieldNode<false>>().toEqualTypeOf<never>();
  });
});
