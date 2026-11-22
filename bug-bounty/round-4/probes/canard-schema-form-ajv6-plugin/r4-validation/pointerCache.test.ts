import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * IN3 and RG1 neighbor of round-3 ajv6 item 2. The fix turns `jsonPointers` on only while the
 * plugin compiles, then restores the consumer's option. AJV 6 caches a compiled validator on the
 * SchemaObject of a schema registered with `addSchema` and reuses it from every later `$ref`,
 * whatever `jsonPointers` was at that later compile. A referenced schema that is not inlined
 * (it contains a `$ref` itself) is therefore compiled once with whichever option came first:
 * - the consumer's code validated it first (dotted paths), so the form's issue gets a mixed path;
 * - the form compiled first (pointer paths), so the consumer's own validation changes format.
 */
const country = { $id: 'https://example.com/country.json', type: 'string', enum: ['KR', 'US'] };
const address = {
  $id: 'https://example.com/address.json',
  type: 'object',
  properties: {
    street: { type: 'string', minLength: 3 },
    country: { $ref: 'country.json' },
  },
};
const formSchema = {
  type: 'object',
  properties: { billing: { $ref: 'https://example.com/address.json' } },
};

const consumerInstance = () => {
  const ajv = new Ajv({ allErrors: true });
  ajv.addSchema(country);
  ajv.addSchema(address);
  return ajv;
};

describe('ajv6 jsonPointers toggle against AJV 6 cached referenced validators', () => {
  it('[control] the form issue under a referenced schema is a JSON Pointer', async () => {
    const ajv = consumerInstance();
    const issues = await createValidator(ajv).compile({ ...formSchema } as any)({
      billing: { street: 'x', country: 'KR' },
    });
    expect((issues ?? []).map((issue) => issue.dataPath)).toEqual(['/billing/street']);
  });

  it('the form issue stays a JSON Pointer after the application validated the referenced schema itself', async () => {
    const ajv = consumerInstance();
    // Application code shares the instance, for example to check an API payload.
    ajv.validate('https://example.com/address.json', { street: 'y' });
    const issues = await createValidator(ajv).compile({ ...formSchema } as any)({
      billing: { street: 'x', country: 'KR' },
    });
    expect((issues ?? []).map((issue) => issue.dataPath)).toEqual(['/billing/street']);
  });

  it("[control] the application's own validation keeps its configured dotted path", () => {
    const ajv = consumerInstance();
    ajv.validate('https://example.com/address.json', { street: 'y' });
    expect(ajv.errors?.map((error) => error.dataPath)).toEqual(['.street']);
  });

  it('a root with $id that the application also registered and used reports the round-3 dynamic key path', async () => {
    // The application shares one schema between its own checks and the form (round 2 recorded
    // that AJV 6 accepts this registration because the cache returns the equal schema object).
    const userSchema = {
      $id: 'https://example.com/user.json',
      type: 'object',
      additionalProperties: { type: 'object', properties: { x: { type: 'string', minLength: 3 } } },
    };
    const ajv = new Ajv({ allErrors: true });
    ajv.addSchema(userSchema);
    ajv.validate('https://example.com/user.json', {});
    const copy = JSON.parse(JSON.stringify(userSchema));
    const issues = await createValidator(ajv).compile(copy)({ "it's": { x: 'a' } });
    expect((issues ?? []).map((issue) => issue.dataPath)).toEqual(["/it's/x"]);
  });

  it("the application's own validation keeps its configured dotted path after a form compiled", async () => {
    const ajv = consumerInstance();
    await createValidator(ajv).compile({ ...formSchema } as any)({ billing: { street: 'abc', country: 'KR' } });
    ajv.validate('https://example.com/address.json', { street: 'y' });
    expect(ajv.errors?.map((error) => error.dataPath)).toEqual(['.street']);
  });
});
