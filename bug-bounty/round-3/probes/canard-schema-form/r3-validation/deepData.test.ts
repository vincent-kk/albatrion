import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';
import { plugin as ajv8 } from '../../../../schema-form-ajv8-plugin/src/default/index';

/** BS1: a terminal object (JSON editor field) holding very deep data, validated twice. */
const deep = (depth: number) => {
  let value: Record<string, unknown> = { leaf: true };
  for (let index = 0; index < depth; index++) value = { child: value };
  return value;
};

describe.each([
  ['ajv6', ajv6.validator],
  ['ajv7', ajv7.validator],
  ['ajv8', ajv8.validator],
] as const)('%s deep terminal data', (_label, validator) => {
  it('validates a form holding 5,000-level terminal data and re-validates after an edit', async () => {
    const root: any = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          doc: { type: 'object', options: { terminal: true } },
          name: { type: 'string', minLength: 3 },
        },
        required: ['missing'],
      } as any,
      defaultValue: { doc: deep(5_000), name: 'a' } as any,
      validationMode: ValidationMode.OnRequest,
      validator,
    });
    const first = await root.validate();
    root.find('/doc').setValue(deep(5_000));
    const second = await root.validate();
    expect([first.map((i: any) => i.keyword).sort(), second.map((i: any) => i.keyword).sort()]).toEqual([
      ['minLength', 'required'],
      ['minLength', 'required'],
    ]);
  });
});
