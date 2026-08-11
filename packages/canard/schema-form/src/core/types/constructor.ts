import type { Fn } from '@aileron/declare';

import type {
  AllowedValue,
  InferValueType,
  JsonSchemaType,
  JsonSchemaWithRef,
  JsonSchemaWithVirtual,
  ValidatorFactory,
} from '@/schema-form/types';

import type { ContextNode } from '../nodes/ContextNode';
import type { SchemaNode } from './node';
import type { ValidationMode } from './state';
import type { HandleChange } from './value';

/**
 * Factory signature used to produce a concrete `SchemaNode` from factory props.
 * Typically used by branch nodes to instantiate children, resolving `$ref` and virtual nodes as needed.
 * @typeParam Schema - JSON Schema type of the node to be created
 */
export type SchemaNodeFactory<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
> = Fn<[props: NodeFactoryProps<Schema>], SchemaNode>;

/**
 * Constructor properties shared by all concrete `SchemaNode` implementations.
 * @typeParam Schema - Node's JSON Schema type
 * @typeParam Value - Node's value type inferred from the schema
 * @property name - Optional human-readable identifier for diagnostics/UI
 * @property scope - Optional stable key for list rendering and reconciliation
 * @property variant - Optional variant identifier for list rendering and reconciliation
 * @property jsonSchema - The JSON Schema definition backing this node
 * @property defaultValue - Initial value applied before user interaction
 * @property onChange - Callback invoked when the node's value changes
 * @property parentNode - Parent in the node graph; undefined for the root
 * @property validationMode - Validation strategy for this node
 * @property validatorFactory - Provides validators compatible with the schema
 * @property required - Indicates whether the value is required by its parent
 */
export interface SchemaNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  name?: string;
  scope?: string;
  variant?: number;
  jsonSchema: Schema;
  schemaType: JsonSchemaType;
  required?: boolean;
  nullable: boolean;
  defaultValue?: Value;
  onChange: HandleChange<Value>;
  parentNode?: SchemaNode;
  validationMode?: ValidationMode;
  validatorFactory?: ValidatorFactory;
  contextNode?: ContextNode;
}

/**
 * Additional constructor properties for branch nodes that can own children.
 * @typeParam Schema - Node's JSON Schema type
 * @property nodeFactory - Factory used to construct child nodes
 */
export interface BranchNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  nodeFactory: SchemaNodeFactory;
}

/**
 * Additional constructor properties for virtual nodes.
 * @typeParam Schema - Node's JSON Schema type
 * @property refNodes - External nodes referenced by this virtual node
 */
export interface VirtualNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  refNodes?: SchemaNode[];
}

/**
 * Props supplied to a `SchemaNodeFactory` call.
 * Combines constructor options while replacing `jsonSchema` with a `$ref`-capable schema.
 * @typeParam Schema - Node's JSON Schema type
 */
export type NodeFactoryProps<Schema extends JsonSchemaWithVirtual> = Omit<
  SchemaNodeConstructorProps<Schema> &
    BranchNodeConstructorProps<Schema> &
    VirtualNodeConstructorProps<Schema>,
  'jsonSchema' | 'schemaType' | 'nullable'
> & {
  jsonSchema: JsonSchemaWithRef;
  schemaType?: JsonSchemaType;
  nullable?: boolean;
};
