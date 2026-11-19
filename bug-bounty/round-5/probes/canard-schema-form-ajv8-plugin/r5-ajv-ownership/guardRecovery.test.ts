import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../default/index';

/**
 * Round 5, hunter r5-ajv-ownership (angles RG3, FP4): a guard that throws because the application
 * has not registered a referenced schema yet, then a later guard and whole validation of the same
 * root after the application registers it, compared with a root that never failed.
 */
const LATE = 'https://r5.invalid/ajv8/guard-recovery/defs.json';
const root = (): JSONSchema => ({
  $id: 'https://r5.invalid/ajv8/guard-recovery/root.json',
  type: 'object',
  properties: {
    a: { if: { $ref: `${LATE}#/definitions/code` }, then: { minLength: 2 } },
    b: { if: { $ref: `${LATE}#/definitions/code` }, then: { minLength: 2 } },
  },
});

const guardVerdict = (compile: () => (value: unknown) => boolean, values: unknown[]) => {
  try {
    const guard = compile();
    return values.map((value) => guard(value));
  } catch (error) {
    return `threw: ${(error as Error).message.split(' from id')[0]}`;
  }
};

describe('ajv8: guard and whole validation after an earlier guard failed on a missing schema', () => {
  it('a later guard and whole validation of the root that failed agree with a root that never failed', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(ajv);
    const failed = root();
    expect(guardVerdict(() => validator.compileGuard(failed, '/properties/a/if'), ['AB'])).toMatch(/^threw: can't resolve reference/);
    ajv.addSchema({ $id: LATE, definitions: { code: { type: 'string', pattern: '^[A-Z]+$' } } });
    const fresh = createValidator(ajv);
    const clean = root();
    const values = ['AB', 'ab', 3];
    expect(guardVerdict(() => validator.compileGuard(failed, '/properties/b/if'), values)).toEqual(
      guardVerdict(() => fresh.compileGuard(clean, '/properties/b/if'), values),
    );
    expect(guardVerdict(() => validator.compileGuard(failed, '/properties/a/if'), values)).toEqual([true, false, false]);
    const data = { a: 'A', b: 'b' };
    expect(await validator.compile(failed)(data)).toEqual(await fresh.compile(clean)(data));
  });
});
