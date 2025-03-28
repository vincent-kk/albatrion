import { SchemaNodeError } from '@/schema-form/errors';
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
  VirtualNodeConstructorProps,
} from './type';

export function schemaNodeFactory<Schema extends JsonSchemaWithVirtual>({
  key,
  name,
  jsonSchema,
  defaultValue,
  parentNode,
  validationMode,
  onChange,
  nodeFactory,
  refNodes,
  ajv,
}: NodeFactoryProps<Schema>) {
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
        defaultValue,
        nodeFactory,
        onChange,
        parentNode,
        validationMode,
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
    // @ts-expect-error: This state is unreachable by design and should NEVER occur.
    `Unknown JsonSchema: ${jsonSchema.type}`,
    {
      jsonSchema,
    },
  );
}
