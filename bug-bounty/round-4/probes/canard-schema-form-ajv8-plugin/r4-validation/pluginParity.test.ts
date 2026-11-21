import { describe, expect, it } from 'vitest';

import { plugin as ajv8 } from '../../default/index';
// Plugin sources resolve their own AJV copies (6.12.6 and 7.2.4) from their package folders.
import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';

/**
 * EQ11. The three default plugins on the same Draft-07 schema and data. Each row compares the
 * routing-relevant fields (keyword, dataPath, rejectedKey) as a sorted multiset; messages and
 * params are AJV-version detail and are not compared.
 */
type Row = [label: string, schema: any, value: unknown];
const rows: Row[] = [
  ['required nested', { type: 'object', properties: { a: { type: 'object', required: ['b'] } } }, { a: {} }],
  ['required name with slash and tilde', { type: 'object', required: ['a/b~c'] }, {}],
  ['additionalProperties false', { type: 'object', properties: { a: {} }, additionalProperties: false }, { a: 1, z: 2 }],
  ['additionalProperties schema', { type: 'object', additionalProperties: { type: 'string' } }, { z: 2 }],
  ['propertyNames pattern', { type: 'object', propertyNames: { pattern: '^[a-z]+$' } }, { A1: 1 }],
  ['propertyNames false', { type: 'object', propertyNames: false }, { k: 1 }],
  ['dependencies array', { type: 'object', dependencies: { a: ['b'] } }, { a: 1 }],
  ['dependencies schema', { type: 'object', dependencies: { a: { required: ['c'] } } }, { a: 1 }],
  ['if then', { type: 'object', properties: { a: { type: 'string', if: { const: 'x' }, then: { minLength: 3 } } } }, { a: 'x' }],
  ['if then false', { type: 'object', properties: { a: { if: { const: 'x' }, then: false } } }, { a: 'x' }],
  ['const object', { type: 'object', properties: { a: { const: { x: 1 } } } }, { a: { x: 2 } }],
  ['enum', { type: 'object', properties: { a: { enum: ['x', 'y'] } } }, { a: 'z' }],
  ['contains', { type: 'object', properties: { a: { type: 'array', contains: { const: 1 } } } }, { a: [2, 3] }],
  ['tuple additionalItems false', { type: 'object', properties: { a: { type: 'array', items: [{ type: 'string' }], additionalItems: false } } }, { a: ['x', 1] }],
  ['items single', { type: 'object', properties: { a: { type: 'array', items: { type: 'string' } } } }, { a: ['x', 1] }],
  ['items false', { type: 'object', properties: { a: { type: 'array', items: false } } }, { a: [1] }],
  ['uniqueItems', { type: 'object', properties: { a: { type: 'array', uniqueItems: true } } }, { a: [1, 1] }],
  ['oneOf both', { type: 'object', properties: { a: { oneOf: [{ type: 'number' }, { minimum: 0 }] } } }, { a: 1 }],
  ['anyOf none', { type: 'object', properties: { a: { anyOf: [{ type: 'string' }, { type: 'boolean' }] } } }, { a: 1 }],
  ['not required single', { type: 'object', not: { required: ['secret'] } }, { secret: 1 }],
  ['not plain', { type: 'object', properties: { a: { not: { type: 'number' } } } }, { a: 1 }],
  ['false property', { type: 'object', properties: { a: false } }, { a: 1 }],
  ['patternProperties', { type: 'object', patternProperties: { '^n_': { type: 'number' } } }, { n_a: 'x' }],
  ['min and max properties', { type: 'object', properties: { a: { type: 'object', minProperties: 2 } } }, { a: { x: 1 } }],
  ['nullable keyword', { type: 'object', properties: { a: { type: 'string', nullable: true } } }, { a: null }],
  ['type array with null', { type: 'object', properties: { a: { type: ['string', 'null'] } } }, { a: 1 }],
  ['exclusiveMinimum -0', { type: 'object', properties: { a: { type: 'number', exclusiveMinimum: 0 } } }, { a: -0 }],
  ['integer 1.5', { type: 'object', properties: { a: { type: 'integer' } } }, { a: 1.5 }],
  ['root type', { type: 'object' }, 'x'],
  ['$ref definitions', { type: 'object', definitions: { s: { type: 'string', minLength: 2 } }, properties: { a: { $ref: '#/definitions/s' } } }, { a: 'x' }],
  ['maxLength astral', { type: 'object', properties: { a: { type: 'string', maxLength: 2 } } }, { a: '😀😀' }],
  ['multipleOf 1 with 1e21', { type: 'object', properties: { a: { type: 'number', multipleOf: 1 } } }, { a: 1e21 }],
];

const shape = async (compile: (schema: any) => (value: unknown) => unknown, schema: any, value: unknown) => {
  try {
    const issues = (await compile(JSON.parse(JSON.stringify(schema)))(value)) as
      | { keyword?: string; dataPath: string; rejectedKey?: string }[]
      | null;
    return (issues ?? []).map((issue) => `${issue.keyword} @${issue.dataPath}${issue.rejectedKey === undefined ? '' : ` key=${issue.rejectedKey}`}`).sort();
  } catch (error) {
    return [`threw ${(error as Error).message}`];
  }
};

describe('three default AJV plugins agree on routing fields', () => {
  it.each(rows)('%s', async (_label, schema, value) => {
    const results = {
      ajv6: await shape((s) => ajv6.validator.compile(s), schema, value),
      ajv7: await shape((s) => ajv7.validator.compile(s), schema, value),
      ajv8: await shape((s) => ajv8.validator.compile(s), schema, value),
    };
    expect({ ajv6: results.ajv6, ajv7: results.ajv7 }).toEqual({ ajv6: results.ajv8, ajv7: results.ajv8 });
  });
});

describe('the same rows with a root $id give the same routing fields in every plugin', () => {
  it.each(rows.filter(([label]) => label !== 'root type'))('%s', async (label, schema, value) => {
    const withId = { ...schema, $id: `https://example.com/parity/${encodeURIComponent(label)}.json` };
    const baseline = await shape((s) => ajv8.validator.compile(s), schema, value);
    const results = {
      ajv6: await shape((s) => ajv6.validator.compile(s), withId, value),
      ajv7: await shape((s) => ajv7.validator.compile(s), withId, value),
      ajv8: await shape((s) => ajv8.validator.compile(s), withId, value),
    };
    expect(results).toEqual({ ajv6: baseline, ajv7: baseline, ajv8: baseline });
  });
});
