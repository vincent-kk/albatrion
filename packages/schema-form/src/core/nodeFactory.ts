import type Ajv from 'ajv';

import { voidFunction } from '@lumy/schema-form/app/constant';
import type { AllowedValue, ExpectJsonSchema } from '@lumy/schema-form/types';

import {
  ArrayNode,
  BooleanNode,
  NumberNode,
  ObjectNode,
  StringNode,
  VirtualNode,
} from './schemaNodes';

function nodeFactory({
  key,
  name,
  schema,
  defaultValue,
  parentNode,
  onChange,
  refNodes,
  ajv,
}: any) {
  switch (schema.type) {
    case 'array':
      return new ArrayNode({
        key,
        name,
        schema,
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
        schema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
    case 'object':
      return new ObjectNode({
        key,
        name,
        schema,
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
        schema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
    case 'virtual':
      return new VirtualNode({
        key,
        name,
        schema,
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
        schema,
        defaultValue,
        parentNode,
        onChange,
        ajv,
      });
  }
  return null;
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
