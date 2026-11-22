import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { plugin as plugin2019 } from '../../2019/index';
import { plugin as plugin2020 } from '../../2020/index';
import { plugin } from '../../default/index';

/**
 * README "Compatibility > JSON Schema Support" lists Draft-06 ✅ and Draft-04 ✅, and
 * "Modern JSON Schema Support" promises "Full support for Draft-07, Draft-06, and Draft-04".
 */
const verdict = async (validator: typeof plugin.validator, schema: object, data: unknown) => {
  try {
    const issues = await validator.compile(schema as any)(data);
    return (issues ?? []).map((issue) => issue.keyword);
  } catch (error) {
    return 'compile threw: ' + (error as Error).message;
  }
};

describe.each([
  ['default', plugin.validator],
  ['2019', plugin2019.validator],
  ['2020', plugin2020.validator],
] as const)('ajv8 %s entry and older drafts', (_label, validator) => {
  it('validates a schema declaring draft-06 $schema', async () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-06/schema#',
      type: 'object',
      properties: { n: { type: 'number', exclusiveMaximum: 10 } },
    };
    expect(await verdict(validator, schema, { n: 11 })).toEqual(['exclusiveMaximum']);
  });

  it('validates a schema declaring draft-04 $schema with boolean exclusiveMaximum', async () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: { n: { type: 'number', maximum: 10, exclusiveMaximum: true } },
    };
    expect(await verdict(validator, schema, { n: 10 })).toEqual(['exclusiveMaximum']);
  });
});

describe('ajv8 README migration example (literal)', () => {
  it('the migration example instance validates format: email ("Format validation is enabled by default")', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const customAjv = new Ajv({
        strict: false,
        validateFormats: true,
      });
      plugin.validator.bind(customAjv);
      const issues = await plugin.validator.compile({
        type: 'object',
        properties: { email: { type: 'string', format: 'email' } },
      } as any)({ email: 'not-an-email' });
      expect({
        keywords: (issues ?? []).map((issue) => issue.keyword),
        warnings: warn.mock.calls.map((call) => String(call[0])),
      }).toEqual({ keywords: ['format'], warnings: [] });
    } finally {
      warn.mockRestore();
    }
  });
});
