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
      validator.compile({ type: 'string', title: 'root ' + index } satisfies JSONSchema);
    ajv.addFormat('even', /^[02468]+$/);
    const issues = await validator.compile({ ...formatSchema } satisfies JSONSchema)({ code: '13' });
    return (issues ?? []).map((issue) => issue.keyword);
  } finally {
    warn.mockRestore();
  }
};

const keywordVerdictAfter = async (earlierRoots: number) => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validator = createValidator(ajv);
  for (let index = 0; index < earlierRoots; index++)
    validator.compile({ type: 'string', title: 'root ' + index } satisfies JSONSchema);
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
  it('[control] with 1 earlier root the later format is validated', async () => {
    expect(await verdictAfter(1)).toEqual(['format']);
  });

  it('with 65 earlier roots the later format is validated the same way', async () => {
    expect(await verdictAfter(65)).toEqual(await verdictAfter(1));
  });

  it('[control] with 1 earlier root the later keyword is validated', async () => {
    expect(await keywordVerdictAfter(1)).toEqual(['isEven']);
  });

  it('with 65 earlier roots the later keyword is validated the same way', async () => {
    expect(await keywordVerdictAfter(65)).toEqual(await keywordVerdictAfter(1));
  });

  it('a guard compiled after the keyword was added agrees with whole validation of the same root', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validator = createValidator(ajv);
    const root = {
      type: 'object',
      properties: {
        a: { type: 'object', if: { properties: { n: { minimum: 0 } } }, then: {} },
        b: { type: 'object', if: { properties: { n: { isEven: true } } }, then: {} },
      },
    } satisfies JSONSchema;
    validator.compileGuard(root, '/properties/a/if');
    ajv.addKeyword({
      keyword: 'isEven',
      type: 'number',
      validate: (schema: boolean, data: number) => !schema || data % 2 === 0,
    });
    const guardB = validator.compileGuard(root, '/properties/b/if');
    const whole = await validator.compile(root)({ b: { n: 3 } });
    const plain = new Ajv({ allErrors: true, strict: false });
    plain.addKeyword({
      keyword: 'isEven',
      type: 'number',
      validate: (schema: boolean, data: number) => !schema || data % 2 === 0,
    });
    expect({
      guard: guardB({ n: 3 }),
      plainIf: plain.validate({ properties: { n: { isEven: true } } }, { n: 3 }),
      wholeIssues: (whole ?? []).length,
    }).toEqual({ guard: false, plainIf: false, wholeIssues: 0 });
  });
});
