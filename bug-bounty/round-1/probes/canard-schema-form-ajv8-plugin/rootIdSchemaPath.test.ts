import { describe, expect, it } from 'vitest';

import { plugin as plugin2019 } from '../../2019';
import { plugin as plugin2020 } from '../../2020';
import { plugin } from '../../default';

describe('sf-validation ajv8 schemaPath for a root with $id', () => {
  it.each([
    ['default', plugin, 'urn:sf-validation:root-default'],
    ['2019', plugin2019, 'urn:sf-validation:root-2019'],
    ['2020', plugin2020, 'urn:sf-validation:root-2020'],
  ])('%s entry reports authored fragment schema paths for a root with $id', async (_, entry, id) => {
    const schema = {
      $id: id,
      type: 'object',
      properties: { a: { type: 'string' } },
      not: { required: ['banned'] },
    };
    const issues = await entry.validator.compile(schema as never)({ a: 1, banned: 1 });
    console.log(JSON.stringify(issues?.map((i) => ({ d: i.dataPath, s: i.schemaPath, r: i.rejectedKey }))));
    expect(issues?.map((i) => i.schemaPath).sort()).toEqual(['#/not', '#/properties/a/type']);
    expect(issues?.find((i) => i.keyword === 'not')?.rejectedKey).toBe('banned');
  });
});
