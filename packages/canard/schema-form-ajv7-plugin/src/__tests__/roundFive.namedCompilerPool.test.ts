import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import type { Options } from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

/** Unique named resources share bounded compilers while live functions retain their own snapshots. */
it('named compiler pools rotate after 64 roots rather than constructing a compiler for every id', async () => {
  for (const mode of ['validation', 'guard', 'both']) {
    let created = 0;
    class CountingConstructor extends Ajv {
      constructor(options?: Options) {
        super(options);
        if (options?.meta === false) created++;
      }
    }
    const source = new CountingConstructor({ allErrors: true, logger: false });
    created = 0;
    const adapter = createValidator(source, { directGuardCompile: false });
    const roots: JSONSchema[] = [];
    const checks: (() => Promise<void>)[] = [];
    for (let index = 0; index < 130; index++) {
      const root: JSONSchema = {
        $id: `https://named-pool.invalid/${mode}/${index}`,
        type: 'object',
        properties: { name: { type: 'string', minLength: 3 + (index % 2) } },
      };
      roots.push(root);
      const validate = mode !== 'guard' ? adapter.compile(root) : undefined;
      const guard =
        mode !== 'validation'
          ? adapter.compileGuard(root, '/properties/name')
          : undefined;
      checks.push(async () => {
        if (validate) {
          expect(await validate({ name: 'x' })).not.toBeNull();
          expect(await validate({ name: 'valid' })).toBeNull();
        }
        if (guard) {
          expect(guard('x')).toBe(false);
          expect(guard('valid')).toBe(true);
        }
      });
    }
    expect
      .soft(created, mode)
      .toBeLessThanOrEqual(mode === 'both' ? 7 : mode === 'validation' ? 4 : 3);
    for (const check of checks) await check();
    for (const root of roots) adapter.release?.(root);
    for (const check of checks) await check();
  }
});
