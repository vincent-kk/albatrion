import type { JSONSchema, ValidatorPlugin } from '@canard/schema-form';
import { describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';
import { ajvValidatorPlugin } from '../../default/validatorPlugin';

describe('BLUEPRINT-044 TEST-077 VALIDATE-051 union types', () => {
  it.each<readonly [string, ValidatorPlugin]>([
    ['default', ajvValidatorPlugin],
    ['2019', plugin2019],
    ['2020', plugin2020],
  ])('compiles a union without a warning in the %s entry', (_entry, plugin) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      plugin.compile({ type: ['string', 'number'] } as unknown as JSONSchema);
      expect(warn).toHaveBeenCalledTimes(0);
    } finally {
      warn.mockRestore();
    }
  });

  it('does not mutate an authored type array when nullable is present', () => {
    const type = ['string', 'number'];
    ajvValidatorPlugin.compile({ type, nullable: true } as unknown as Parameters<typeof ajvValidatorPlugin.compile>[0]);
    expect(type).toEqual(['string', 'number']);
  });
});
