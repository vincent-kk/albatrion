import { isFunction } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json-schema';

import type { SetStateFn } from '@aileron/types';

import type { Ajv } from '@/schema-form/helpers/ajv';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import { schemaNodeFactory } from './nodes';
import type {
  InferSchemaNode,
  NodeFactoryProps,
  ValidationMode,
} from './nodes/type';

interface NodeFromSchemaProps<
  Schema extends JsonSchema,
  Value extends AllowedValue,
> {
  jsonSchema: Schema;
  defaultValue?: Value;
  onChange?: SetStateFn<Value>;
  validationMode?: ValidationMode;
  ajv?: Ajv;
}

export const nodeFromJsonSchema = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>({
  jsonSchema,
  defaultValue,
  onChange,
  validationMode,
  ajv,
}: NodeFromSchemaProps<Schema, Value>) =>
  schemaNodeFactory({
    name: JSONPath.Root,
    jsonSchema,
    defaultValue,
    nodeFactory: schemaNodeFactory,
    onChange: isFunction(onChange) ? onChange : undefined,
    validationMode,
    ajv,
  } as NodeFactoryProps<Schema>) as InferSchemaNode<Schema>;
