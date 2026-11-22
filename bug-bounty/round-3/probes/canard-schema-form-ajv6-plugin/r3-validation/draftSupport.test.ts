import { describe, expect, it } from 'vitest';

import { plugin } from '../../index';

/** README "Compatibility > JSON Schema Support" lists Draft-04, Draft-06 and Draft-07. */
const verdict = async (schema: object, data: unknown) => {
  try {
    const issues = await plugin.validator.compile(schema as any)(data);
    return (issues ?? []).map((issue) => issue.keyword);
  } catch (error) {
    return 'compile threw: ' + (error as Error).message;
  }
};

describe('ajv6 older drafts listed as supported', () => {
  it('validates a schema declaring draft-06 $schema', async () => {
    expect(
      await verdict(
        {
          $schema: 'http://json-schema.org/draft-06/schema#',
          type: 'object',
          properties: { n: { type: 'number', exclusiveMaximum: 10 } },
        },
        { n: 11 },
      ),
    ).toEqual(['exclusiveMaximum']);
  });

  it('validates a schema declaring draft-04 $schema with boolean exclusiveMaximum', async () => {
    expect(
      await verdict(
        {
          $schema: 'http://json-schema.org/draft-04/schema#',
          type: 'object',
          properties: { n: { type: 'number', maximum: 10, exclusiveMaximum: true } },
        },
        { n: 10 },
      ),
    ).toEqual(['maximum']);
  });
});
