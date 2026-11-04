import type {
  ArraySchema,
  BooleanSchema,
  JSONSchemaWithVirtual,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from '@/schema-form/__legacy__/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { BooleanNode } from '../nodes/BooleanNode';
import type { NullNode } from '../nodes/NullNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import type { VirtualNode } from '../nodes/VirtualNode';

/** Classifies only an explicitly authored inline branch type. */
type InlineTypeKind<Type> = Type extends
  | 'object'
  | 'array'
  | 'null'
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
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

/** Identifies a statically invalid object/array mixture without guessing refs. */
type HasMixedContainer<Kind> = 'unsupported' extends Kind
  ? false
  : 'object' extends Kind
    ? [Exclude<Kind, 'object' | 'null'>] extends [never]
      ? false
      : true
    : 'array' extends Kind
      ? [Exclude<Kind, 'array' | 'null'>] extends [never]
        ? false
        : true
      : false;

/** Requires a nonempty inline branch tuple before narrowing the host node. */
type InlineHostNode<Branches> = Branches extends readonly [unknown, ...unknown[]]
  ? InlineBranchKind<Branches[number]> extends infer Kind
    ? HasMixedContainer<Kind> extends true
      ? never
      : [Kind] extends ['object' | 'null']
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

/** Maps literal values to JSON kinds, retaining invalid object/array values. */
type LiteralKind<Value> = Value extends string
  ? 'string'
  : Value extends number
    ? 'number'
    : Value extends boolean
      ? 'boolean'
      : Value extends null
        ? 'null'
        : 'unsupported';

/** Resolves one primitive kind; enum mixtures are invalid, const unions unknown. */
type LiteralNodeForKinds<Kinds, Mixed> = 'unsupported' extends Kinds
  ? never
  : [Exclude<Kinds, 'null'>] extends [never]
    ? NullNode
    : [Exclude<Kinds, 'null'>] extends ['string']
      ? StringNode
      : [Exclude<Kinds, 'null'>] extends ['number']
        ? NumberNode
        : [Exclude<Kinds, 'null'>] extends ['boolean']
          ? BooleanNode
          : Mixed;

/** Keeps literal inference narrow only when all enum values have one JSON kind. */
type LiteralSchemaNode<Schema> = Schema extends { const: infer Value }
  ? LiteralNodeForKinds<LiteralKind<Value>, SchemaNode>
  : Schema extends { enum: infer Values }
    ? Values extends readonly [unknown, ...unknown[]]
      ? LiteralNodeForKinds<LiteralKind<Values[number]>, never>
      : Values extends readonly []
        ? never
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
