import type { JsonSchemaScanner } from 'winglet/json-schema/dist';

import { JSONPath, isFunction } from '@winglet/common-utils';

import type { SetStateFn } from '@aileron/declare';

import type { Ajv } from '@/schema-form/helpers/ajv';
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
  schemaResolver?: JsonSchemaScanner;
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
  schemaResolver,
  ajv,
}: NodeFromSchemaProps<Schema, Value>) => {
  const nodeFactory = createSchemaNodeFactory(schemaResolver);
  const handleChange = isFunction(onChange)
    ? (onChange as SetStateFn<AllowedValue>)
    : undefined;
  return nodeFactory({
    name: JSONPath.Root,
    jsonSchema,
    defaultValue,
    nodeFactory,
    onChange: handleChange,
    validationMode,
    ajv,
  }) as InferSchemaNode<Schema>;
};
