import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

// Current plugin sources, not their (older) built dist.
import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';
import { plugin as ajv8 } from '../../../../schema-form-ajv8-plugin/src/default/index';

/**
 * A map entry under additionalProperties has no node (it is an extras value), so its issue
 * belongs to no field. Under AJV6, the key "it's" breaks the plugin's dataPath decoder and the
 * nested issue is reported at `/x`, the address of an unrelated valid root field.
 */
const schema = {
  type: 'object',
  properties: { x: { type: 'string' } },
  additionalProperties: {
    type: 'object',
    properties: { x: { type: 'string', minLength: 3 } },
  },
} as const;

describe.each([
  ['ajv6', ajv6.validator],
  ['ajv7', ajv7.validator],
  ['ajv8', ajv8.validator],
] as const)('%s map entry issue routing', (_label, validator) => {
  it("an issue inside map entry \"it's\" is not shown on the valid root field x", async () => {
    const root = nodeFromJSONSchema({
      jsonSchema: schema as any,
      defaultValue: { x: 'valid', "it's": { x: 'a' } } as any,
      validationMode: ValidationMode.OnRequest,
      validator,
    });
    const all = await root.validate();
    expect({
      all: all.map((issue) => [issue.keyword, issue.dataPath]),
      fieldX: root.find('/x')?.errors.map((issue) => issue.keyword),
    }).toEqual({ all: [['minLength', "/it's/x"]], fieldX: [] });
  });
});
