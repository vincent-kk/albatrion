import Ajv, { type KeywordCxt } from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../default';

/** An application keyword whose value is a subschema compiled in place. */
const addWrap = (ajv: Ajv) =>
  ajv.addKeyword({
    keyword: 'wrap',
    schemaType: 'object',
    code(cxt: KeywordCxt) {
      const valid = cxt.gen.name('valid');
      cxt.subschema({ keyword: 'wrap' }, valid);
      cxt.pass(valid);
    },
  });

const make = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addWrap(ajv);
  return ajv;
};

describe('format inside an application keyword subschema', () => {
  it.each([
    ['standard position', { allOf: [{ type: 'string', format: 'slow' }] }],
    ['keyword subschema', { wrap: { type: 'string', format: 'slow' } }],
  ])('reports an asynchronous format in %s', async (_kind, schema) => {
    const ajv = make();
    ajv.addFormat('slow', {
      async: true,
      validate: async (value: string) => value.length > 3,
    });
    const validate = createValidator(ajv).compile(schema as any);
    const issues = await validate('ab');
    expect(issues?.map((issue) => issue.keyword)).toContain('format');
    expect(await validate('abcd')).toBeNull();
  });

  it.each([
    ['standard position', { allOf: [{ type: 'string', format: 'even' }] }],
    ['keyword subschema', { wrap: { type: 'string', format: 'even' } }],
  ])(
    'uses a format replaced after the first compile in %s',
    async (_kind, schema) => {
      const ajv = make();
      ajv.addFormat('even', (value: string) => value.length % 2 === 0);
      const validator = createValidator(ajv);
      expect(await validator.compile(schema as any)('abc')).not.toBeNull();
      ajv.addFormat('even', (value: string) => value.length % 2 === 1);
      expect(await validator.compile(schema as any)('abc')).toBeNull();
    },
  );
});
