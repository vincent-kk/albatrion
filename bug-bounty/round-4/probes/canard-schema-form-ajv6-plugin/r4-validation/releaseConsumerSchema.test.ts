import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * IN3 (shared AJV instance). Round 2 recorded that AJV 6 accepts a root whose `$id` the bound
 * instance already holds when the content is equal, because AJV 6's cache returns the consumer's
 * schema object. `release` then removes by `$id` and by key, which deletes the consumer's own
 * registration (CLAUDE.md: "Cleanup by id alone can otherwise erase a consumer schema").
 */
const userSchema = {
  $id: 'https://example.com/user.json',
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
};

describe("ajv6 release and the application's own registration of the same schema", () => {
  it("[control] without the form the application's registration validates", () => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addSchema(userSchema);
    expect(ajv.validate('https://example.com/user.json', { name: 'x' })).toBe(false);
  });

  it("releasing the form root keeps the application's registration of the same $id", async () => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addSchema(userSchema);
    const validator = createValidator(ajv);
    const copy = JSON.parse(JSON.stringify(userSchema));
    const issues = await validator.compile(copy)({ name: 'x' });
    validator.release!(copy);
    let after: unknown;
    try {
      after = ajv.validate('https://example.com/user.json', { name: 'x' });
    } catch (error) {
      after = `threw: ${(error as Error).message}`;
    }
    expect({ formIssues: (issues ?? []).map((issue) => issue.keyword), after }).toEqual({
      formIssues: ['minLength'],
      after: false,
    });
  });
});
