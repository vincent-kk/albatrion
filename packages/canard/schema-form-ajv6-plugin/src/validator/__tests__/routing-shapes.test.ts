import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('VALIDATE-043 18C-53 routing shapes', () => {
  it('preserves ajv6 schemaPath below a referenced union branch', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const schema = {
      definitions: { branch: { oneOf: [
        { properties: { kind: { const: 'a' } }, required: ['kind'] },
        { properties: { kind: { const: 'b' } }, required: ['kind'] },
      ] } },
      $ref: '#/definitions/branch',
    };
    const issues = await ajvValidatorPlugin.compile(schema)({ kind: 'c' });
    expect(issues?.some((issue) => issue.schemaPath?.includes('/oneOf/0/'))).toBe(true);
    expect(issues?.some((issue) => issue.schemaPath?.includes('/oneOf/1/'))).toBe(true);
  });

  it('points a missing required child at its own path', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const issues = await ajvValidatorPlugin.compile({ type: 'object', required: ['child'] })({});
    expect(issues?.[0]?.dataPath).toBe('/child');
  });
});
