import Ajv8 from 'ajv';
import draft06for8 from 'ajv/dist/refs/json-schema-draft-06.json';
import { describe, expect, it } from 'vitest';

import { createValidator as createAjv8 } from '../../default/index';
import Ajv6 from '../../../../schema-form-ajv6-plugin/node_modules/ajv';
import draft06for6 from '../../../../schema-form-ajv6-plugin/node_modules/ajv/lib/refs/json-schema-draft-06.json';
import { createValidator as createAjv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import Ajv7 from '../../../../schema-form-ajv7-plugin/node_modules/ajv';
import draft06for7 from '../../../../schema-form-ajv7-plugin/node_modules/ajv/dist/refs/json-schema-draft-06.json';
import { createValidator as createAjv7 } from '../../../../schema-form-ajv7-plugin/src/index';

/**
 * RG1 for the round-3 documentation fixes (ajv6 3, ajv7 2, ajv8 2): the README examples
 * "Enabling a declared Draft-06 schema" run as written and report exclusiveMaximum.
 */
const draftSchema = () => ({
  $schema: 'http://json-schema.org/draft-06/schema#',
  type: 'number',
  exclusiveMaximum: 5,
});

const run = async (validator: any) => {
  try {
    const issues = await validator.compile(draftSchema())(5);
    return (issues ?? []).map((issue: any) => issue.keyword);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

describe('README Draft-06 examples', () => {
  it('ajv6 README example', async () => {
    const ajv = new (Ajv6 as any)({ allErrors: true, nullable: true, format: false });
    ajv.addMetaSchema(draft06for6);
    expect(await run(createAjv6(ajv))).toEqual(['exclusiveMaximum']);
  });
  it('ajv7 README example', async () => {
    const ajv = new (Ajv7 as any)({ allErrors: true, strict: false, validateFormats: false });
    ajv.addMetaSchema(draft06for7);
    expect(await run(createAjv7(ajv))).toEqual(['exclusiveMaximum']);
  });
  it('ajv8 README example', async () => {
    const ajv = new Ajv8({ allErrors: true, strict: false, validateFormats: false });
    ajv.addMetaSchema(draft06for8);
    expect(await run(createAjv8(ajv))).toEqual(['exclusiveMaximum']);
  });
});
