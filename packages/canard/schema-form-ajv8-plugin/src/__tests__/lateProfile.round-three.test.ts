import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { createValidator } from '../default/index';

const formatSchema: JSONSchema = {
  type: 'object',
  properties: { code: { type: 'string', format: 'even' } },
};

const verdictAfter = async (earlierRoots: number) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(ajv);
    for (let index = 0; index < earlierRoots; index++)
      validator.compile({
        type: 'string',
        title: 'root ' + index,
      } satisfies JSONSchema);
    ajv.addFormat('even', /^[02468]+$/);
    const issues = await validator.compile({
      ...formatSchema,
    } satisfies JSONSchema)({ code: '13' });
    return (issues ?? []).map((issue) => issue.keyword);
  } finally {
    warn.mockRestore();
  }
};

const keywordVerdictAfter = async (earlierRoots: number) => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(ajv);
  for (let index = 0; index < earlierRoots; index++)
    validator.compile({
      type: 'string',
      title: 'root ' + index,
    } satisfies JSONSchema);
  ajv.addKeyword({
    keyword: 'isEven',
    type: 'number',
    validate: (schema: boolean, data: number) => !schema || data % 2 === 0,
  });
  const issues = await validator.compile({
    type: 'object',
    properties: { n: { type: 'number', isEven: true } },
  } satisfies JSONSchema)({ n: 3 });
  return (issues ?? []).map((issue) => issue.keyword);
};

describe('ajv8 createValidator: format and keyword added to the bound instance after earlier compiles', () => {
  it.each([1, 65])('validates the later format after %s earlier roots', async (earlierRoots) => {
    expect(await verdictAfter(earlierRoots)).toEqual(['format']);
  });

  it.each([1, 65])('validates the later keyword after %s earlier roots', async (earlierRoots) => {
    expect(await keywordVerdictAfter(earlierRoots)).toEqual(['isEven']);
  });
});

it.each([true, false])(
  'late rule registration agrees across direct and contextual guards (%s)',
  (directGuardCompile) => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(ajv, { directGuardCompile });
    const root = {
      type: 'object',
      properties: {
        a: { if: { minimum: 0 } },
        b: { if: { type: 'number', isEven: true } },
      },
    } as const;
    validator.compileGuard(root, '/properties/a/if');
    ajv.addKeyword({
      keyword: 'isEven',
      type: 'number',
      validate: (schema: boolean, data: number) => !schema || data % 2 === 0,
    });
    expect(validator.compileGuard(root, '/properties/b/if')(3)).toBe(false);
  },
);
