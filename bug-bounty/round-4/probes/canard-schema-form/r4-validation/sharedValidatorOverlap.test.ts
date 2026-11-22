import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

// Current plugin sources, not their built dist.
import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';
import { plugin as ajv8 } from '../../../../schema-form-ajv8-plugin/src/default/index';

/**
 * Form-level symptom of overlapping calls to one synchronous AJV function. Two forms that use the
 * same schema object and the same validator share one compiled validator (VALIDATE-048). When
 * their validations overlap, the invalid form receives the valid form's empty verdict.
 * - explicit: `Promise.all` over both forms' `validate()`, as a page that saves several rows does;
 * - automatic: both forms mount in one task where frames are unavailable (a hidden document or a
 *   host without requestAnimationFrame), so both load slots run in one batched macrotask.
 */
const schema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
} as const;
const schemaWithId = { ...schema, $id: 'https://example.com/row.json' } as const;

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

describe.each([
  ['ajv7, root without $id', ajv7.validator, schema],
  ['ajv6, root with $id', ajv6.validator, schemaWithId],
  ['[control] ajv8, root without $id', ajv8.validator, schema],
] as const)('%s: two forms sharing schema object and validator', (_label, validator, jsonSchema) => {
  it('explicit validate() of both forms at once reports the invalid form as invalid', async () => {
    const build = (name: string) =>
      nodeFromJSONSchema({
        jsonSchema: jsonSchema as any,
        defaultValue: { name } as any,
        validationMode: ValidationMode.OnRequest,
        validator,
      });
    const invalidForm = build('x');
    const validForm = build('valid name');
    const [invalidIssues, validIssues] = await Promise.all([invalidForm.validate(), validForm.validate()]);
    expect({
      invalid: invalidIssues.map((issue) => issue.keyword),
      valid: validIssues.map((issue) => issue.keyword),
      nameField: invalidForm.find('/name')?.errors.map((issue) => issue.keyword),
    }).toEqual({ invalid: ['minLength'], valid: [], nameField: ['minLength'] });
  });

  it('automatic validation of two forms mounted together shows the invalid form error', async () => {
    const build = (name: string) =>
      nodeFromJSONSchema({
        jsonSchema: jsonSchema as any,
        defaultValue: { name } as any,
        validationMode: ValidationMode.OnChange,
        validator,
      });
    const invalidForm = build('x');
    const validForm = build('valid name');
    await settle();
    expect({
      nameField: invalidForm.find('/name')?.errors.map((issue) => issue.keyword),
      other: validForm.find('/name')?.errors.map((issue) => issue.keyword),
    }).toEqual({ nameField: ['minLength'], other: [] });
  });
});
