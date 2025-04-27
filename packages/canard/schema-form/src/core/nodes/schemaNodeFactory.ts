import type { JsonSchemaScanner } from '@winglet/json-schema';

import { SchemaNodeError } from '@/schema-form/errors';
import type {
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
  ArrayNodeConstructorProps,
  BranchNodeConstructorProps,
  NodeFactoryProps,
  SchemaNodeConstructorProps,
  SchemaNodeFactory,
  VirtualNodeConstructorProps,
} from './type';

export const createSchemaNodeFactory =
  <Schema extends JsonSchemaWithVirtual>(
    schemaResolver?: JsonSchemaScanner,
  ): SchemaNodeFactory<Schema> =>
  ({
    key,
    name,
    jsonSchema: inputJsonSchema,
    defaultValue,
    parentNode,
    validationMode,
    onChange,
    nodeFactory,
    refNodes,
    ajv,
  }: NodeFactoryProps<Schema>) => {
    const jsonSchema =
      schemaResolver?.scan(inputJsonSchema).getValue() || inputJsonSchema;
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
          ajv,
        } as SchemaNodeConstructorProps<NumberSchema>);
      case 'string':
        return new StringNode({
          key,
          name,
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
          itemSchema:
            schemaResolver?.scan(jsonSchema.items).getValue() ||
            jsonSchema.items,
          defaultValue,
          nodeFactory,
          onChange,
          parentNode,
          validationMode,
          ajv,
        } as ArrayNodeConstructorProps);
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
          ajv,
        } as VirtualNodeConstructorProps<VirtualSchema>);
    }
    throw new SchemaNodeError(
      'UNKNOWN_JSON_SCHEMA',
      `Unknown JsonSchema: ${jsonSchema.type}`,
      {
        jsonSchema,
      },
    );
  };
