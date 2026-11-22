import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * RG1 neighbor of round-3 ajv7 item 1. The fix made sibling instances read the bound instance's
 * live `formats` and `RULES`, but `cloneInstance` still copies consumer schemas (`addSchema`) once.
 * A schema the application registers on its instance after the 64-root pool rotation, or after a
 * root's first guard compile, is then invisible to later compiles that reference it.
 */
const DEFS_ID = 'https://example.com/defs.json';
const defs = {
  $id: DEFS_ID,
  definitions: { code: { type: 'string', pattern: '^[A-Z]+$' } },
};
const formSchema = {
  type: 'object',
  properties: { code: { $ref: `${DEFS_ID}#/definitions/code` } },
};

const verdictAfter = async (earlierRoots: number) => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(ajv);
  for (let index = 0; index < earlierRoots; index++)
    validator.compile({ type: 'string', title: 'root ' + index } as any);
  ajv.addSchema(defs);
  try {
    const issues = await validator.compile({ ...formSchema } as any)({ code: 'abc' });
    return (issues ?? []).map((issue) => issue.keyword);
  } catch (error) {
    return `compile threw: ${(error as Error).message}`;
  }
};

describe('ajv7 createValidator: schema added to the bound instance after earlier compiles', () => {
  it('[control] with 1 earlier root the later root resolves the added schema', async () => {
    expect(await verdictAfter(1)).toEqual(['pattern']);
  });

  it('with 65 earlier roots the later root resolves the added schema the same way', async () => {
    expect(await verdictAfter(65)).toEqual(['pattern']);
  });

  it('a guard compiled after the schema was added resolves it like whole validation of the same root', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(ajv);
    const root = {
      type: 'object',
      properties: {
        a: { type: 'string', if: { const: 'x' }, then: { minLength: 2 } },
        b: {
          type: 'string',
          if: { $ref: `${DEFS_ID}#/definitions/code` },
          then: { minLength: 5 },
        },
      },
    } as any;
    // The form compiles the first guard at mount; the application loads its shared schema later.
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
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(ajv);
    const root = {
      type: 'object',
      properties: {
        b: {
          type: 'string',
          if: { $ref: `${DEFS_ID}#/definitions/code` },
          then: { minLength: 5 },
        },
      },
    } as any;
    ajv.addSchema(defs);
    expect(validator.compileGuard(root, '/properties/b/if')('AB')).toBe(true);
  });
});
