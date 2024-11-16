import type Ajv from 'ajv';

import { voidFunction } from '@lumy/schema-form/app/constant';
import type {
  AllowedValue,
  InferSchemaType,
  JsonSchema,
} from '@lumy/schema-form/types';

import { schemaNodeFactory } from './schemaNodes';
import type { NodeFactoryProps } from './schemaNodes/type';

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
}: NodeFromSchemaProps<Schema, InferSchemaType<Schema>>) => {
  return schemaNodeFactory({
    name: '',
    jsonSchema,
    defaultValue: defaultValue || undefined,
    onChange: typeof onChange === 'function' ? onChange : voidFunction,
    ajv: ajv,
  } as NodeFactoryProps<Schema>);
};
