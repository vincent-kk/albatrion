import { voidFunction } from '@lumy/schema-form/app/constant';
import type { Ajv } from '@lumy/schema-form/helpers';
import {
  type AllowedValue,
  type InferValueType,
  JSONPath,
  type JsonSchema,
} from '@lumy/schema-form/types';

import { schemaNodeFactory } from './schemaNodes';
import type { InferSchemaNode, NodeFactoryProps } from './schemaNodes/type';

interface NodeFromSchemaProps<
  Schema extends JsonSchema,
  Value extends AllowedValue,
> {
  jsonSchema: Schema;
  defaultValue?: Value | undefined;
  onChange?: SetStateFn<Value | undefined>;
  ajv?: Ajv;
}

export const schemaNodeFromSchema = <Schema extends JsonSchema>({
  jsonSchema,
  defaultValue,
  onChange,
  ajv,
}: NodeFromSchemaProps<Schema, InferValueType<Schema>>) =>
  schemaNodeFactory({
    name: JSONPath.Root,
    jsonSchema,
    defaultValue,
    onChange: typeof onChange === 'function' ? onChange : voidFunction,
    ajv,
  } as NodeFactoryProps<Schema>) as InferSchemaNode<Schema>;
