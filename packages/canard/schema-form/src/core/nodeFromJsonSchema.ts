import { isFunction } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json';

import type { SetStateFn } from '@aileron/declare';

import type { Ajv } from '@/schema-form/helpers/ajv';
import { getResolveSchema } from '@/schema-form/helpers/jsonSchema';
import type { AllowedValue, JsonSchema } from '@/schema-form/types';

import { createSchemaNodeFactory } from './nodes';
import type { InferSchemaNode, ValidationMode } from './nodes/type';

/** Properties interface for creating Node from JSON Schema */
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

/**
 * Creates SchemaNode from JSON Schema.
 * @typeParam Schema - JSON Schema type
 * @typeParam Value - Value type, defaults to type inferred from Schema
 * @param props - Properties for Node creation
 * @returns Created SchemaNode
 */
export const nodeFromJsonSchema = <
  Schema extends JsonSchema,
  Value extends AllowedValue,
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
    onChange: isFunction(onChange) ? (onChange as SetStateFn<any>) : undefined,
    validationMode,
    ajv,
  }) as InferSchemaNode<Schema>;
};
