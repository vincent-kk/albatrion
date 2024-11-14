import { voidFunction } from '@lumy/schema-form/app/constant';
import type { AllowedValue, ExpectJsonSchema } from '@lumy/schema-form/types';
import type Ajv from 'ajv';

import {
  ArrayNode,
  BooleanNode,
  NumberNode,
  ObjectNode,
  StringNode,
  VirtualNode,
} from './schemaNodes';

export function nodeFactory({
  key,
  name,
  jsonSchema,
  defaultValue,
  parentNode,
  onChange,
  refNodes,
  ajv,
}: any) {
  switch (jsonSchema.type) {
    case 'array':
      return new ArrayNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
        nodeFactory,
      });
    case 'number':
      return new NumberNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
    case 'object':
      return new ObjectNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
        nodeFactory,
      });
    case 'string':
      return new StringNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
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
      });
    case 'boolean':
      return new BooleanNode({
        key,
        name,
        jsonSchema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
  }

  throw new Error(`Unknown schema type: ${jsonSchema.type}`);
}

interface Options<V> {
  defaultValue?: V;
  onChange?: SetStateAction<V>;
  ajv?: Ajv;
}

export const nodeFromSchema = <V extends AllowedValue>(
  schema: ExpectJsonSchema<V>,
  options?: Options<V>,
) => {
  return nodeFactory({
    name: '',
    schema,
    defaultValue: options?.defaultValue || undefined,
    onChange:
      typeof options?.onChange === 'function' ? options.onChange : voidFunction,
    ajv: options?.ajv,
  });
};
