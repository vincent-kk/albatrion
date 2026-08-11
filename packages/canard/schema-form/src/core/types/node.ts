import type {
  ArraySchema,
  BooleanSchema,
  JsonSchemaWithVirtual,
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

/**
 * Compile-time utility that maps a JSON Schema to its concrete `SchemaNode` implementation.
 * Supports both regular schemas (e.g., NumberSchema) and nullable schemas (e.g., NumberNullableSchema).
 * Falls back to the broad `SchemaNode` union when the schema type cannot be narrowed.
 * @typeParam Schema - JSON Schema used as the basis for node inference
 */
export type InferSchemaNode<Schema extends JsonSchemaWithVirtual | unknown> =
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
                : SchemaNode;

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
