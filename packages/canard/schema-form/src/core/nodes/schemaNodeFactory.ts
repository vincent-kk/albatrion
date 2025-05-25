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
  ({
    key,
    name,
    jsonSchema: schema,
    defaultValue,
    onChange,
    nodeFactory,
    parentNode,
    refNodes,
    validationMode,
    required,
    ajv,
  }: NodeFactoryProps<Schema>) => {
    const jsonSchema = (resolveSchema?.(schema) ||
      schema) as JsonSchemaWithVirtual;
    switch (jsonSchema.type) {
      case 'boolean':
        return new BooleanNode({
          key,
          name,
          jsonSchema,
          defaultValue,
          onChange,
          parentNode,
          validationMode,
          required,
          ajv,
        } as SchemaNodeConstructorProps<BooleanSchema>);
      case 'number':
      case 'integer':
        return new NumberNode({
          key,
          name,
          jsonSchema,
          defaultValue,
          onChange,
          parentNode,
          validationMode,
          required,
          ajv,
        } as SchemaNodeConstructorProps<NumberSchema>);
      case 'string':
        return new StringNode({
          key,
          name,
          required,
          jsonSchema,
          defaultValue,
          onChange,
          parentNode,
          validationMode,
          ajv,
        } as SchemaNodeConstructorProps<StringSchema>);
      case 'array':
        return new ArrayNode({
          key,
          name,
          jsonSchema,
          defaultValue,
          nodeFactory,
          onChange,
          parentNode,
          validationMode,
          required,
          ajv,
        } as BranchNodeConstructorProps<ArraySchema>);
      case 'object':
        return new ObjectNode({
          key,
          name,
          jsonSchema,
          defaultValue,
          nodeFactory,
          onChange,
          parentNode,
          validationMode,
          required,
          ajv,
        } as BranchNodeConstructorProps<ObjectSchema>);
      case 'null':
        return new NullNode({
          key,
          name,
          jsonSchema,
          defaultValue,
          onChange,
          parentNode,
          validationMode,
          required,
          ajv,
        } as SchemaNodeConstructorProps<NullSchema>);
      case 'virtual':
        return new VirtualNode({
          key,
          name,
          jsonSchema,
          defaultValue,
          onChange,
          parentNode,
          refNodes,
          validationMode,
          required,
          ajv,
        } as VirtualNodeConstructorProps<VirtualSchema>);
    }

    throw new SchemaNodeError(
      'UNKNOWN_JSON_SCHEMA',
      // @ts-expect-error: This line should be unreachable if all variants are handled.
      `Unknown JsonSchema: ${jsonSchema.type}`,
      {
        jsonSchema,
      },
    );
  };
