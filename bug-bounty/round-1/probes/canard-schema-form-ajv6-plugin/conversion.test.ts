import { describe, expect, it } from 'vitest';

import { plugin } from '../../index';

const compile = (schema: object) => plugin.validator.compile(schema as never);

describe('sf-validation ajv6 conversion probes', () => {
  it('reports not-required rejected key under a property whose name needs URI encoding', async () => {
    const schema = {
      type: 'object',
      properties: { '이름 a': { type: 'object', not: { required: ['x'] } } },
    };
    const issues = await compile(schema)({ '이름 a': { x: 1 } });
    console.log(JSON.stringify(issues?.map((i) => ({ k: i.keyword, d: i.dataPath, s: i.schemaPath, r: i.rejectedKey }))));
    expect(issues?.[0]).toMatchObject({ keyword: 'not', dataPath: '/이름 a', rejectedKey: 'x' });
  });

  it('keeps a value-level false schema (then: false) on the value instead of rejecting its key', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', if: { const: 'admin' }, then: false } },
    };
    const issues = await compile(schema)({ name: 'admin' });
    const falseIssue = issues?.find((i) => i.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath: '/name' });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it('reports required child with special name', async () => {
    const schema = { type: 'object', required: ['a/b~c', '', "it's"] };
    const issues = await compile(schema)({});
    console.log(JSON.stringify(issues?.map((i) => ({ d: i.dataPath, p: i.details }))));
    expect(issues?.map((i) => i.dataPath)).toEqual(['/a~1b~0c', '/', "/it's"]);
  });

  it('reports required child nested under a quoted parent', async () => {
    const schema = {
      type: 'object',
      properties: { "o'k": { type: 'object', required: ['x y'] } },
    };
    const issues = await compile(schema)({ "o'k": {} });
    console.log(JSON.stringify(issues?.map((i) => ({ d: i.dataPath, p: i.details, raw: (i.source as { dataPath: string }).dataPath }))));
    expect(issues?.map((i) => i.dataPath)).toEqual(["/o'k/x y"]);
  });
});
