import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('VALIDATE-043 18C-53 routing shapes', () => {
  it('keeps schemaPath under both referenced union branches', async () => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false }));
    const issues = await ajvValidatorPlugin.compile({
      definitions: { branch: { oneOf: [
        { properties: { kind: { const: 'a' } }, required: ['kind'] },
        { properties: { kind: { const: 'b' } }, required: ['kind'] },
      ] } },
      $ref: '#/definitions/branch',
    })({ kind: 'c' });
    expect(issues?.some((issue) => issue.schemaPath?.includes('/oneOf/0/'))).toBe(true);
    expect(issues?.some((issue) => issue.schemaPath?.includes('/oneOf/1/'))).toBe(true);
  });

  it('routes a missing required child to its path', async () => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false }));
    const issues = await ajvValidatorPlugin.compile({ type: 'object', required: ['child'] })({});
    expect(issues?.[0]?.dataPath).toBe('/child');
  });
});
