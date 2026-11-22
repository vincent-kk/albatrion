import type { JSONSchema } from '@canard/schema-form';
import { describe, expect, it } from 'vitest';

import { plugin as plugin2019 } from '../2019';
import { plugin as plugin2020 } from '../2020';
import { plugin } from '../default';

describe('ValidationIssue.schemaPath for a root with $id', () => {
  it.each([
    ['default', plugin, 'urn:schema-form-ajv8:schema-path-root-default'],
    ['2019', plugin2019, 'urn:schema-form-ajv8:schema-path-root-2019'],
    ['2020', plugin2020, 'urn:schema-form-ajv8:schema-path-root-2020'],
  ])('%s entry reports authored fragment schema paths for a root with $id', async (_, entry, id) => {
    const schema = {
      $id: id,
      type: 'object',
      properties: { a: { type: 'string' } },
      not: { required: ['banned'] },
    } as unknown as JSONSchema;
    const issues = await entry.validator.compile(schema)({ a: 1, banned: 1 });
    expect(issues?.map((issue) => issue.schemaPath).sort()).toEqual(['#/not', '#/properties/a/type']);
    expect(issues?.find((issue) => issue.keyword === 'not')?.rejectedKey).toBe('banned');
  });

  it('keeps the fragment paths AJV reports when it calls a root with $id instead of inlining it', async () => {
    const schema = {
      $id: 'urn:schema-form-ajv8:schema-path-root-called',
      type: 'object',
      definitions: { text: { type: 'string' } },
      properties: { a: { $ref: '#/definitions/text' }, b: { type: 'object', not: { required: ['z'] } } },
    } as unknown as JSONSchema;
    const issues = await plugin.validator.compile(schema)({ a: 1, b: { z: 1 } });
    expect(issues?.map((issue) => [issue.schemaPath, issue.rejectedKey])).toEqual([
      ['#/definitions/text/type', undefined],
      ['#/properties/b/not', 'z'],
    ]);
  });
});
