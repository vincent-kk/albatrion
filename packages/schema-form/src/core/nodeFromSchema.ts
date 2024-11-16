import { voidFunction } from '@lumy/schema-form/app/constant';
import type { InferSchemaType, JsonSchema } from '@lumy/schema-form/types';
import type Ajv from 'ajv';

import { nodeFactory } from './schemaNodes';
import type { NodeFactoryProps } from './schemaNodes/type';

interface Options<Value> {
  defaultValue?: Value | undefined;
  onChange?: SetStateFn<Value | undefined>;
  ajv?: Ajv;
}

export const nodeFromSchema = <Schema extends JsonSchema>(
  schema: Schema,
  options?: Options<InferSchemaType<Schema>>,
) => {
  return nodeFactory({
    name: '',
    jsonSchema: schema,
    defaultValue: options?.defaultValue || undefined,
    onChange:
      typeof options?.onChange === 'function' ? options.onChange : voidFunction,
    ajv: options?.ajv,
  } as NodeFactoryProps<Schema>);
};
