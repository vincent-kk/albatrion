import type {
  ArraySchema,
  BooleanSchema,
  JSONSchemaWithVirtual,
  NullSchema,
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

/** Classifies only an explicitly authored inline branch type. */
type InlineTypeKind<Type> = Type extends 'object' | 'array' | 'null'
  ? Type
  : Type extends readonly string[]
    ? [Type[number]] extends [never]
      ? 'unsupported'
      : [Exclude<Type[number], 'null'>] extends [never]
        ? 'null'
        : [Exclude<Type[number], 'null'>] extends ['object']
          ? 'object'
          : [Exclude<Type[number], 'null'>] extends ['array']
            ? 'array'
            : 'unsupported'
    : 'unsupported';

/** Marks refs and gated branches as beyond public static inference. */
type InlineBranchKind<Branch> = Branch extends { $ref: unknown }
  ? 'unsupported'
  : Branch extends {
        controls: { active: unknown } | { discriminator: unknown };
      }
    ? 'unsupported'
    : Branch extends { type: infer Type }
      ? InlineTypeKind<Type>
      : 'unsupported';

/** Requires a nonempty inline branch tuple before narrowing the host node. */
type InlineHostNode<Branches> = Branches extends readonly [unknown, ...unknown[]]
  ? InlineBranchKind<Branches[number]> extends infer Kind
    ? [Kind] extends ['object' | 'null']
      ? 'object' extends Kind
        ? ObjectNode
        : NullNode
      : [Kind] extends ['array' | 'null']
        ? 'array' extends Kind
          ? ArrayNode
          : NullNode
        : SchemaNode
    : SchemaNode
  : SchemaNode;

/** Maps a branch-free primitive literal to the corresponding node. */
type LiteralNode<Value> = Value extends string
  ? StringNode
  : Value extends number
    ? NumberNode
    : Value extends boolean
      ? BooleanNode
      : Value extends null
        ? NullNode
        : SchemaNode;

/** Keeps literal inference narrow only when all enum values have one JSON kind. */
type LiteralSchemaNode<Schema> = Schema extends { const: infer Value }
  ? LiteralNode<Value>
  : Schema extends { enum: infer Values }
    ? Values extends readonly [unknown, ...unknown[]]
      ? LiteralNode<Values[number]> extends infer Node
        ? Exclude<Node, NullNode> extends infer NonNullNode
          ? [NonNullNode] extends [never]
            ? NullNode
            : [NonNullNode] extends [StringNode]
              ? StringNode
              : [NonNullNode] extends [NumberNode]
                ? NumberNode
                : [NonNullNode] extends [BooleanNode]
                  ? BooleanNode
                  : SchemaNode
          : SchemaNode
        : SchemaNode
      : SchemaNode
    : SchemaNode;

/**
 * Compile-time utility that maps a JSON Schema to its concrete `SchemaNode` implementation.
 * Supports both regular schemas (e.g., NumberSchema) and nullable schemas (e.g., NumberNullableSchema).
 * Falls back to the broad `SchemaNode` union when the schema type cannot be narrowed.
 * @typeParam Schema - JSON Schema used as the basis for node inference
 */
export type InferSchemaNode<Schema extends JSONSchemaWithVirtual | unknown> =
  Schema extends ArraySchema
    ? ArrayNode
    : Schema extends NumberSchema
      ? NumberNode
      : Schema extends ObjectSchema
        ? ObjectNode
        : Schema extends StringSchema
          ? StringNode
          : Schema extends BooleanSchema
            ? BooleanNode
            : Schema extends VirtualSchema
              ? VirtualNode
              : Schema extends NullSchema
                ? NullNode
                : Schema extends { $ref: unknown } | { allOf: unknown }
                  ? SchemaNode
                  : Schema extends { controls: { discriminator: unknown } }
                    ? SchemaNode
                    : Schema extends { oneOf: infer Branches }
                    ? Schema extends { anyOf: unknown }
                      ? SchemaNode
                      : InlineHostNode<Branches>
                    : Schema extends { anyOf: infer Branches }
                      ? InlineHostNode<Branches>
                      : LiteralSchemaNode<Schema>;

/** Discriminated union of all concrete schema node implementations. */
export type SchemaNode =
  | ArrayNode
  | NumberNode
  | ObjectNode
  | StringNode
  | BooleanNode
  | VirtualNode
  | NullNode;

/**
 * Represents a child entry inside a branch node (e.g., `ObjectNode`, `ArrayNode`).
 * Optional metadata assists with identity and rendering strategies for children.
 */
export interface ChildNode {
  nonce?: string;
  virtual?: boolean;
  node: SchemaNode;
}
