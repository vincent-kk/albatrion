import { SchemaNodeError } from '@/schema-form/errors';
import type { ResolveSchema } from '@/schema-form/helpers/jsonSchema';
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

import { ArrayNode } from './ArrayNode';
import { BooleanNode } from './BooleanNode';
import { NullNode } from './NullNode';
import { NumberNode } from './NumberNode';
import { ObjectNode } from './ObjectNode';
import { StringNode } from './StringNode';
import { VirtualNode } from './VirtualNode';
import type {
  BranchNodeConstructorProps,
  NodeFactoryProps,
  SchemaNodeConstructorProps,
  SchemaNodeFactory,
  VirtualNodeConstructorProps,
} from './type';

/**
 * Creates a SchemaNode factory function that matches the JSON Schema type.
 * @note Before creating SchemaNode, it resolves the references in the JSON Schema.
 * @typeParam Schema - The JSON Schema type
 * @param resolveSchema - Schema resolution function used to resolve references
 * @returns A factory function that creates SchemaNode instances
 */
export const createSchemaNodeFactory =
  <Schema extends JsonSchemaWithVirtual>(
    resolveSchema: ResolveSchema | null,
  ): SchemaNodeFactory<Schema> =>
  (props: NodeFactoryProps<Schema>) => {
    const constructorProps = resolveReferences(props, resolveSchema);
    switch (constructorProps.jsonSchema.type) {
      case 'boolean':
        return new BooleanNode(
          constructorProps as SchemaNodeConstructorProps<BooleanSchema>,
        );
      case 'number':
      case 'integer':
        return new NumberNode(
          constructorProps as SchemaNodeConstructorProps<NumberSchema>,
        );
      case 'string':
        return new StringNode(
          constructorProps as SchemaNodeConstructorProps<StringSchema>,
        );
      case 'array':
        return new ArrayNode(
          constructorProps as BranchNodeConstructorProps<ArraySchema>,
        );
      case 'object':
        return new ObjectNode(
          constructorProps as BranchNodeConstructorProps<ObjectSchema>,
        );
      case 'null':
        return new NullNode(
          constructorProps as SchemaNodeConstructorProps<NullSchema>,
        );
      case 'virtual':
        return new VirtualNode(
          constructorProps as VirtualNodeConstructorProps<VirtualSchema>,
        );
    }
    throw new SchemaNodeError(
      'UNKNOWN_JSON_SCHEMA',
      // @ts-expect-error: This line should be unreachable if all variants are handled.
      `Unknown JsonSchema: ${constructorProps.jsonSchema.type}`,
      {
        jsonSchema: constructorProps.jsonSchema,
      },
    );
  };

const resolveReferences = <Schema extends JsonSchemaWithVirtual>(
  nodeFactoryProps: NodeFactoryProps<Schema>,
  resolveSchema: ResolveSchema | null,
) => {
  if (resolveSchema)
    nodeFactoryProps.jsonSchema =
      resolveSchema(nodeFactoryProps.jsonSchema) || nodeFactoryProps.jsonSchema;
  return nodeFactoryProps as UnionSchemaNodeConstructorProps;
};

type UnionSchemaNodeConstructorProps =
  | SchemaNodeConstructorProps<BooleanSchema>
  | SchemaNodeConstructorProps<NumberSchema>
  | SchemaNodeConstructorProps<StringSchema>
  | BranchNodeConstructorProps<ArraySchema>
  | BranchNodeConstructorProps<ObjectSchema>
  | SchemaNodeConstructorProps<NullSchema>
  | VirtualNodeConstructorProps<VirtualSchema>;
