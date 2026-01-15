import { map } from '@winglet/common-utils/array';
import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

import { JsonSchemaError } from '@/schema-form/errors';
import { formatUnknownJsonSchemaError } from '@/schema-form/helpers/error';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';
import {
  type ResolveSchema,
  extractSchemaInfo,
  processAllOfSchema,
} from '@/schema-form/helpers/jsonSchema';
import type {
  ArraySchema,
  BooleanSchema,
  JsonSchema,
  JsonSchemaWithRef,
  JsonSchemaWithVirtual,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  ObjectValue,
  StringSchema,
  VirtualSchema,
} from '@/schema-form/types';

import { ArrayNode, validateArraySchema } from './ArrayNode';
import { BooleanNode } from './BooleanNode';
import { ContextNode } from './ContextNode';
import { NullNode } from './NullNode';
import { NumberNode } from './NumberNode';
import { ObjectNode } from './ObjectNode';
import { StringNode } from './StringNode';
import { VirtualNode } from './VirtualNode';
import {
  type BranchNodeConstructorProps,
  type NodeFactoryProps,
  type SchemaNodeConstructorProps,
  type SchemaNodeFactory,
  ValidationMode,
  type VirtualNodeConstructorProps,
} from './type';

/**
 * Creates a context ObjectNode for sharing form-wide data across all nodes.
 * @note The context node is a terminal ObjectNode with no validation.
 * @param defaultValue - Initial value for the context node
 * @returns An ObjectNode instance for form-wide context data
 */
export const contextNodeFactory = (defaultValue?: ObjectValue) =>
  new ContextNode({
    jsonSchema: { type: 'object' },
    schemaType: 'object',
    name: JSONPointer.Context,
    nullable: false,
    defaultValue,
    onChange: NOOP_FUNCTION,
    validationMode: ValidationMode.None,
  });

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
    const nodeProps = resolveReferences(props, resolveSchema);
    switch (nodeProps.schemaType) {
      case 'boolean':
        return new BooleanNode(
          nodeProps as SchemaNodeConstructorProps<BooleanSchema>,
        );
      case 'number':
      case 'integer':
        return new NumberNode(
          nodeProps as SchemaNodeConstructorProps<NumberSchema>,
        );
      case 'string':
        return new StringNode(
          nodeProps as SchemaNodeConstructorProps<StringSchema>,
        );
      case 'array':
        if (nodeProps.jsonSchema.items)
          nodeProps.jsonSchema.items = processSchema(
            nodeProps.jsonSchema.items,
            resolveSchema,
          );
        if (isArray(nodeProps.jsonSchema.prefixItems))
          nodeProps.jsonSchema.prefixItems = map(
            nodeProps.jsonSchema.prefixItems,
            (schema) => processSchema(schema, resolveSchema),
          );
        validateArraySchema(nodeProps.jsonSchema as ArraySchema);
        return new ArrayNode(
          nodeProps as BranchNodeConstructorProps<ArraySchema>,
        );
      case 'object':
        return new ObjectNode(
          nodeProps as BranchNodeConstructorProps<ObjectSchema>,
        );
      case 'null':
        return new NullNode(
          nodeProps as SchemaNodeConstructorProps<NullSchema>,
        );
      case 'virtual':
        return new VirtualNode(
          nodeProps as VirtualNodeConstructorProps<VirtualSchema>,
        );
    }
    throw new JsonSchemaError(
      'UNKNOWN_JSON_SCHEMA',
      formatUnknownJsonSchemaError(
        nodeProps.jsonSchema.type,
        nodeProps.jsonSchema,
      ),
      {
        jsonSchema: nodeProps.jsonSchema,
      },
    );
  };

const processSchema = (
  schema: JsonSchemaWithRef,
  resolve: ResolveSchema | null,
) => {
  if (resolve) schema = resolve(schema) || schema;
  return processAllOfSchema(schema as JsonSchema);
};

const resolveReferences = <Schema extends JsonSchemaWithVirtual>(
  nodeProps: NodeFactoryProps<Schema>,
  resolve: ResolveSchema | null,
) => {
  nodeProps.jsonSchema = processSchema(nodeProps.jsonSchema, resolve);
  const schemaInfo = extractSchemaInfo(nodeProps.jsonSchema);
  if (schemaInfo === null) return nodeProps;
  nodeProps.schemaType = schemaInfo.type;
  nodeProps.nullable = schemaInfo.nullable;
  return nodeProps as UnionSchemaNodeConstructorProps;
};

type UnionSchemaNodeConstructorProps =
  | SchemaNodeConstructorProps<BooleanSchema>
  | SchemaNodeConstructorProps<NumberSchema>
  | SchemaNodeConstructorProps<StringSchema>
  | BranchNodeConstructorProps<ArraySchema>
  | BranchNodeConstructorProps<ObjectSchema>
  | SchemaNodeConstructorProps<NullSchema>
  | VirtualNodeConstructorProps<VirtualSchema>;
