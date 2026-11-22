import { describe, expect, it } from 'vitest';

import { plugin } from '../../default';

const compile = (schema: object) => plugin.validator.compile(schema as never);

describe('sf-validation ajv8 conversion probes', () => {
  it('reports not-required rejected key under a property whose name needs URI encoding', async () => {
    const schema = {
      type: 'object',
      properties: { '이름 a': { type: 'object', not: { required: ['x'] } } },
    };
    const issues = await compile(schema)({ '이름 a': { x: 1 } });
    console.log(JSON.stringify(issues?.map((i) => ({ k: i.keyword, d: i.dataPath, s: i.schemaPath, r: i.rejectedKey }))));
    expect(issues?.[0]).toMatchObject({ keyword: 'not', dataPath: '/이름 a', rejectedKey: 'x' });
  });

  it('reports required child with special name', async () => {
    const schema = { type: 'object', required: ['a/b~c', ''] };
    const issues = await compile(schema)({});
    expect(issues?.map((i) => i.dataPath)).toEqual(['/a~1b~0c', '/']);
  });

  it('keeps a value-level false schema (then: false) on the value instead of rejecting its key', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', if: { const: 'admin' }, then: false },
      },
    };
    const issues = await compile(schema)({ name: 'admin' });
    console.log(JSON.stringify(issues?.map((i) => ({ k: i.keyword, d: i.dataPath, s: i.schemaPath, r: i.rejectedKey }))));
    const falseIssue = issues?.find((i) => i.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath: '/name' });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it('attaches the rejected key to every issue a propertyNames failure produces', async () => {
    const schema = {
      type: 'object',
      properties: { meta: { type: 'object', propertyNames: { pattern: '^a' } } },
    };
    const issues = await compile(schema)({ meta: { bad: 1 } });
    console.log(JSON.stringify(issues?.map((i) => ({ k: i.keyword, d: i.dataPath, r: i.rejectedKey, pn: (i.source as { propertyName?: string }).propertyName }))));
    expect(issues?.length).toBe(2);
    for (const issue of issues ?? []) expect(issue).toMatchObject({ dataPath: '/meta', rejectedKey: 'bad' });
  });

  it('dump misc shapes', async () => {
    const schema = {
      type: 'object',
      properties: {
        arr: { type: 'array', items: [{ type: 'string' }], additionalItems: false },
        dep: { type: 'object', dependencies: { a: ['b'] } },
        f: { allOf: [false] },
      },
    };
    const issues = await compile(schema)({ arr: ['a', 'b'], dep: { a: 1 }, f: 1 });
    console.log(JSON.stringify(issues?.map((i) => ({ k: i.keyword, d: i.dataPath, s: i.schemaPath, r: i.rejectedKey }))));
  });
});
