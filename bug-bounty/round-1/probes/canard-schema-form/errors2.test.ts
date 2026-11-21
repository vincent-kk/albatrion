import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const build = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({
    jsonSchema,
    defaultValue,
    validator: createTestValidator(),
    ...extra,
  }) as any;

const objArr = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      items: {
        type: 'object',
        properties: { n: { type: 'string', minLength: 2 } },
      },
    },
  },
};

const dump = (root: any) => ({
  global: (root.globalErrors ?? []).map((e: any) => e.dataPath),
  items: root
    .find('/arr')
    .children.map((c: any) => [c.find('n').path, c.find('n').value, c.find('n').errors.map((e: any) => e.dataPath)]),
});

describe('error routing diag', () => {
  it.each(['insert0', 'remove0', 'push', 'insertMid'])('%s', async (op) => {
    const root = build(objArr, { arr: [{ n: 'aa' }, { n: 'b' }, { n: 'cc' }] });
    await root.validate();
    const before = dump(root);
    const arr = root.find('/arr');
    if (op === 'insert0') arr.insert(0, { n: 'zz' });
    if (op === 'remove0') arr.remove(0);
    if (op === 'push') arr.push({ n: 'zz' });
    if (op === 'insertMid') arr.insert(1, { n: 'zz' });
    await new Promise((r) => setTimeout(r, 30));
    const after = dump(root);
    const badPaths = after.items
      .filter((i: any) => i[1] === 'b')
      .map((i: any) => i[0]);
    expect({ before, after }).toMatchObject({
      after: { global: badPaths },
    });
    for (const i of after.items) expect(i[2]).toEqual(i[1] === 'b' ? [i[0]] : []);
  });
});
