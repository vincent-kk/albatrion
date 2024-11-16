import type {
  ArraySchema,
  BooleanSchema,
  JsonSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from '@lumy/schema-form/types';

import {
  ArrayNode,
  BooleanNode,
  NumberNode,
  ObjectNode,
  StringNode,
  VirtualNode,
} from './';
import type {
  NodeFactoryProps,
  SchemaNodeConstructorProps,
  VirtualNodeConstructorProps,
} from './type';

export function nodeFactory<Schema extends JsonSchema>({
  key,
  name,
  jsonSchema,
  defaultValue,
  parentNode,
  onChange,
  refNodes,
  ajv,
}: NodeFactoryProps<Schema>) {
  switch (jsonSchema.type) {
    case 'boolean': {
      return new BooleanNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<BooleanSchema>);
    }
    case 'number': {
      return new NumberNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<NumberSchema>);
    }
    case 'string': {
      return new StringNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<StringSchema>);
    }
    case 'array': {
      return new ArrayNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<ArraySchema>);
    }
    case 'object': {
      return new ObjectNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<ObjectSchema>);
    }
    case 'virtual': {
      return new VirtualNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        refNodes,
        ajv,
      } as VirtualNodeConstructorProps<VirtualSchema>);
    }
  }
  throw new Error(`Unknown schema type: ${jsonSchema.type}`);
}
