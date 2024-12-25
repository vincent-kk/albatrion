import { isFunction } from '@winglet/common-utils';

import type { Ajv } from '@/schema-form/helpers/ajv';
import {
  type AllowedValue,
  type InferValueType,
  JSONPath,
  type JsonSchema,
} from '@/schema-form/types';

import { schemaNodeFactory } from './nodes';
import type { InferSchemaNode, NodeFactoryProps } from './nodes/type';

interface NodeFromSchemaProps<
  Schema extends JsonSchema,
  Value extends AllowedValue,
> {
  jsonSchema: Schema;
  defaultValue?: Value | undefined;
  onChange?: SetStateFn<Value | undefined>;
  ajv?: Ajv;
}

export const nodeFromJsonSchema = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>({
  jsonSchema,
  defaultValue,
  onChange,
  ajv,
}: NodeFromSchemaProps<Schema, Value>) =>
  schemaNodeFactory({
    name: JSONPath.Root,
    jsonSchema,
    defaultValue,
    onChange: isFunction(onChange) ? onChange : undefined,
    nodeFactory: schemaNodeFactory,
    ajv,
  } as NodeFactoryProps<Schema>) as InferSchemaNode<Schema>;
