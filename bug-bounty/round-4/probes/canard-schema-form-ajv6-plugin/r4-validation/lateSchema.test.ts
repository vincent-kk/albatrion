import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * RG1 neighbor of the round-3 ajv6 sibling fix (late formats and keywords). `cloneInstance` reads
 * the bound instance's live `_formats` and `RULES`, but copies consumer schemas (`addSchema`) once.
 * Each root's guard instance is a clone made at its first guard compile, so a schema the
 * application registers later is invisible to that root's later guards, while whole validation on
 * the bound instance resolves it.
 */
const DEFS_ID = 'https://example.com/defs.json';
const defs = {
  $id: DEFS_ID,
  definitions: { code: { type: 'string', pattern: '^[A-Z]+$' } },
};

const rootWithTwoGuards = () =>
  ({
    type: 'object',
    properties: {
      a: { type: 'string', if: { const: 'x' }, then: { minLength: 2 } },
      b: {
        type: 'string',
        if: { $ref: `${DEFS_ID}#/definitions/code` },
        then: { minLength: 5 },
      },
    },
  }) as any;

describe('ajv6 createValidator: schema added to the bound instance after a guard compile', () => {
  it('a guard compiled after the schema was added resolves it like whole validation of the same root', async () => {
    const ajv = new Ajv({ allErrors: true });
    const validator = createValidator(ajv);
    const root = rootWithTwoGuards();
    validator.compileGuard(root, '/properties/a/if')('x');
    ajv.addSchema(defs);
    const whole = await validator.compile(root)({ a: 'xx', b: 'AB' });
    let guardVerdict: unknown;
    try {
      guardVerdict = validator.compileGuard(root, '/properties/b/if')('AB');
    } catch (error) {
      guardVerdict = `compileGuard threw: ${(error as Error).message}`;
    }
    expect({
      whole: (whole ?? []).map((issue) => [issue.keyword, issue.dataPath]),
      guard: guardVerdict,
    }).toEqual({ whole: [['minLength', '/b'], ['if', '/b']], guard: true });
  });

  it('[control] a guard compiled first after the schema was added resolves it', () => {
    const ajv = new Ajv({ allErrors: true });
    const validator = createValidator(ajv);
    const root = rootWithTwoGuards();
    ajv.addSchema(defs);
    expect(validator.compileGuard(root, '/properties/b/if')('AB')).toBe(true);
  });
});
