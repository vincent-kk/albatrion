import Ajv, { type KeywordCxt } from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../default';

/** An application keyword whose value is a subschema compiled in place (like ajv-keywords `select`). */
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
  ])('async format in %s compiles and rejects', async (_kind, schema) => {
    const ajv = make();
    ajv.addFormat('slow', {
      async: true,
      validate: async (value: string) => value.length > 3,
    });
    const native = ajv.compile({ ...structuredClone(schema), $async: true });
    await expect(native('ab')).rejects.toThrow();
    const validate = createValidator(ajv).compile(schema as any);
    expect(await validate('ab')).not.toBeNull();
    expect(await validate('abcd')).toBeNull();
  });

  it.each([
    ['standard position', { allOf: [{ type: 'string', format: 'even' }] }],
    ['keyword subschema', { wrap: { type: 'string', format: 'even' } }],
  ])('replaced format in %s is observed on recompile', async (_kind, schema) => {
    const ajv = make();
    ajv.addFormat('even', (value: string) => value.length % 2 === 0);
    const validator = createValidator(ajv);
    expect(await validator.compile(schema as any)('abc')).not.toBeNull();
    ajv.addFormat('even', (value: string) => value.length % 2 === 1);
    expect(await validator.compile(schema as any)('abc')).toBeNull();
  });
});
