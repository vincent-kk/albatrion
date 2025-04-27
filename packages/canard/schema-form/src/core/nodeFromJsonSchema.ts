import { JSONPath, isFunction } from '@winglet/common-utils';

import type { SetStateFn } from '@aileron/declare';

import type { Ajv } from '@/schema-form/helpers/ajv';
import { getResolveSchema } from '@/schema-form/helpers/jsonSchema';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import { createSchemaNodeFactory } from './nodes';
import type { InferSchemaNode, ValidationMode } from './nodes/type';

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
}: NodeFromSchemaProps<Schema, Value>) => {
  const resolveSchema = getResolveSchema(jsonSchema);
  const nodeFactory = createSchemaNodeFactory(resolveSchema);
  return nodeFactory({
    name: JSONPath.Root,
    jsonSchema,
    defaultValue,
    nodeFactory,
    onChange: isFunction(onChange) ? onChange : undefined,
    validationMode,
    ajv,
  }) as InferSchemaNode<Schema>;
};
