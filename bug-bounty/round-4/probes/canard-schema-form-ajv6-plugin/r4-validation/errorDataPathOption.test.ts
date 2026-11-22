import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * RG1 neighbor of round-3 ajv6 item 2 (the plugin normalizes the consumer's `jsonPointers`).
 * AJV 6's `errorDataPath: 'property'` option, which a bound consumer instance may carry, moves the
 * dataPath of `required`, `additionalProperties` and `dependencies` issues to the property itself.
 * The issue path should not depend on that option.
 */
const schema = {
  type: 'object',
  properties: { profile: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
};

const paths = async (options: object) => {
  const issues = await createValidator(new Ajv({ allErrors: true, ...options })).compile(
    JSON.parse(JSON.stringify(schema)),
  )({ profile: {} });
  return (issues ?? []).map((issue) => `${issue.keyword} ${issue.dataPath}`);
};

describe('ajv6 issue paths and the consumer errorDataPath option', () => {
  it('[control] default errorDataPath', async () => {
    expect(await paths({})).toEqual(['required /profile/name']);
  });
  it("errorDataPath: 'property' gives the same path", async () => {
    expect(await paths({ errorDataPath: 'property' })).toEqual(['required /profile/name']);
  });
});
