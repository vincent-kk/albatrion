import { JSONPath, isFunction } from '@winglet/common-utils';

import type { SetStateFn } from '@aileron/declare';

import type { Ajv } from '@/schema-form/helpers/ajv';
import { getResolveSchema } from '@/schema-form/helpers/jsonSchema';
import type { AllowedValue, JsonSchema } from '@/schema-form/types';

import { createSchemaNodeFactory } from './nodes';
import type { InferSchemaNode, ValidationMode } from './nodes/type';

/**
 * JSON Schema로부터 Node를 생성하기 위한 속성 인터페이스
 */
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
 * JSON Schema로부터 SchemaNode를 생성합니다.
 * @typeParam Schema - JSON Schema 타입
 * @typeParam Value - 값의 타입, 기본값은 Schema로부터 추론된 타입
 * @param props - Node 생성을 위한 속성
 * @returns 생성된 SchemaNode
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
