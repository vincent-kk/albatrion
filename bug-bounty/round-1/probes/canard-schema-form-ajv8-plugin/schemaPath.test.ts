import { describe, expect, it } from 'vitest';

import { plugin } from '../../default';

describe('sf-validation ajv8 rejectedKey through resources', () => {
  it('does not fabricate a rejected key from the root required list for a not-required inside a nested $id resource', async () => {
    const schema = {
      type: 'object',
      required: ['name'],
      definitions: {
        item: { $id: 'urn:item', type: 'object', not: { required: ['banned'] } },
      },
      properties: {
        name: { type: 'string' },
        b: { $ref: 'urn:item' },
      },
    };
    const issues = await plugin.validator.compile(schema as never)({ name: 'n', b: { banned: 1 } });
    const notIssue = issues?.find((i) => i.keyword === 'not');
    console.log(JSON.stringify(notIssue && { d: notIssue.dataPath, s: notIssue.schemaPath, r: notIssue.rejectedKey }));
    expect(notIssue?.dataPath).toBe('/b');
    expect(notIssue?.rejectedKey).not.toBe('name');
    expect(notIssue?.rejectedKey).toBe('banned');
  });

  it('reports the rejected key for a root-level not-required in a root with $id', async () => {
    const schema = {
      $id: 'urn:sf-validation:root',
      type: 'object',
      not: { required: ['banned'] },
    };
    const issues = await plugin.validator.compile(schema as never)({ banned: 1 });
    const notIssue = issues?.find((i) => i.keyword === 'not');
    console.log(JSON.stringify(notIssue && { d: notIssue.dataPath, s: notIssue.schemaPath, r: notIssue.rejectedKey }));
    expect(notIssue).toMatchObject({ dataPath: '', rejectedKey: 'banned' });
  });
});
