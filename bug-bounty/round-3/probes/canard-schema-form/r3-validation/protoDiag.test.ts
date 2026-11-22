import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

import { plugin as ajv8 } from '../../../../schema-form-ajv8-plugin/src/default/index';

const objectWith = (name: string, value: unknown) => {
  const result: Record<string, unknown> = {};
  Object.defineProperty(result, name, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return result;
};

it('[diagnostic] __proto__ field value and verdict', async () => {
  const schema = {
    type: 'object',
    properties: objectWith('__proto__', { type: 'string', minLength: 3 }),
    required: ['__proto__'],
  } as any;
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: objectWith('__proto__', 'a') as any,
    validationMode: ValidationMode.OnRequest,
    validator: ajv8.validator,
  });
  const field = (root.children ?? []).find((c: any) => c.name === '__proto__') as any;
  const value = root.value as object;
  const plainAjv = new Ajv({ allErrors: true, strict: false });
  const plainVerdict = plainAjv.validate(schema, JSON.parse('{"__proto__":"a"}'));
  console.log(
    JSON.stringify({
      fieldValue: field?.value,
      fieldPath: field?.path,
      rootOwnKeys: Object.getOwnPropertyNames(value),
      rootProtoIsObjectProto: Object.getPrototypeOf(value) === Object.prototype,
      outputOwnKeys: Object.getOwnPropertyNames(root.outputValue ?? {}),
      plainAjvErrors: plainVerdict ? [] : plainAjv.errors?.map((e) => e.keyword),
    }),
  );
  const errors = await root.validate();
  console.log(JSON.stringify(errors));
  expect(errors.map((e) => e.keyword)).toEqual(['minLength']);
});
