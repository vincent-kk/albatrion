import { voidFunction } from '@lumy/schema-form/app/constant';
import type { AllowedValue, ExpectJsonSchema } from '@lumy/schema-form/types';
import type Ajv from 'ajv';

import { nodeFactory } from './schemaNodes';

interface Options<V> {
  defaultValue?: V;
  onChange?: SetStateFn<V>;
  ajv?: Ajv;
}

export const nodeFromSchema = <V extends AllowedValue>(
  schema: ExpectJsonSchema<V>,
  options?: Options<V>,
) => {
  return nodeFactory({
    name: '',
    jsonSchema: schema,
    defaultValue: options?.defaultValue || undefined,
    onChange:
      typeof options?.onChange === 'function' ? options.onChange : voidFunction,
    ajv: options?.ajv,
  });
};
