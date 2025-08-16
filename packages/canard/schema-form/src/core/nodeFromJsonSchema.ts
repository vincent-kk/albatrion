import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import { JSONPointer } from '@/schema-form/helpers/jsonPointer';
import { getResolveSchema } from '@/schema-form/helpers/jsonSchema';
import type {
  AllowedValue,
  JsonSchema,
  ValidatorFactory,
} from '@/schema-form/types';

import { createSchemaNodeFactory } from './nodes';
import type { InferSchemaNode, ValidationMode } from './nodes/type';

/** Properties interface for creating Node from JSON Schema */
interface NodeFromSchemaProps<
  Schema extends JsonSchema,
  Value extends AllowedValue,
> {
  jsonSchema: Schema;
  defaultValue?: Value;
  onChange?: Fn<[value: Value]>;
  validationMode?: ValidationMode;
  validatorFactory?: ValidatorFactory;
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
  validatorFactory,
}: NodeFromSchemaProps<Schema, Value>) => {
  const resolveSchema = getResolveSchema(jsonSchema);
  const nodeFactory = createSchemaNodeFactory(resolveSchema);
  return nodeFactory({
    name: JSONPointer.Separator,
    jsonSchema,
    defaultValue,
    nodeFactory,
    onChange: isFunction(onChange) ? (onChange as Fn<[unknown]>) : undefined,
    validationMode,
    validatorFactory,
  }) as InferSchemaNode<Schema>;
};
