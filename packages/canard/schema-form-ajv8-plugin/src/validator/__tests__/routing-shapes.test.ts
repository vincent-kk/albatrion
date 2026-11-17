import type { JSONSchema, ValidatorPlugin } from '@canard/schema-form';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin as defaultPlugin } from '../../default/validatorPlugin';
import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';

describe('VALIDATE-043 routing shapes', () => {
  it.each<readonly [string, ValidatorPlugin]>([
    ['default', defaultPlugin],
    ['2019', plugin2019],
    ['2020', plugin2020],
  ])('preserves the authored $ref schemaPath for %s', async (_name, plugin) => {
    const schema = {
      $defs: { choice: { type: 'object', properties: { kind: { const: 'expected' } } } },
      oneOf: [{ $ref: '#/$defs/choice' }, { type: 'object', properties: { kind: { const: 'other' } } }],
    };
    expect(typeof plugin.compileGuard).toBe('function');
    expect(typeof plugin.release).toBe('function');
    const issues = await plugin.compile(schema as unknown as JSONSchema)({ kind: 'wrong' });
    expect(issues?.some((error) => error.schemaPath?.includes('/$defs/choice/'))).toBe(true);
    expect(issues?.some((error) => error.keyword === 'oneOf')).toBe(true);
  });
});
