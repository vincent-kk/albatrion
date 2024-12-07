import type {
  ArraySchema,
  BooleanSchema,
  JsonSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from '@lumy-form/types';

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

export function schemaNodeFactory<Schema extends JsonSchema>({
  key,
  name,
  jsonSchema,
  defaultValue,
  parentNode,
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
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<BooleanSchema>);
    case 'number':
    case 'integer':
      return new NumberNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<NumberSchema>);
    case 'string':
      return new StringNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<StringSchema>);
    case 'array':
      return new ArrayNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        nodeFactory,
        ajv,
      } as BranchNodeConstructorProps<ArraySchema>);
    case 'object':
      return new ObjectNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        nodeFactory,
        ajv,
      } as BranchNodeConstructorProps<ObjectSchema>);
    case 'virtual':
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
    case 'null':
      return new NullNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      } as SchemaNodeConstructorProps<NullSchema>);
  }

  // @ts-expect-error: This state is unreachable by design and should NEVER occur.
  throw new Error(`Unknown JsonSchema: ${jsonSchema.type}`, {
    jsonSchema,
  });
}
