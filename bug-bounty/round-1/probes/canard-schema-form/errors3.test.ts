import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { ValidationMode } from '@/schema-form/core/engine';
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
    .children.map((c: any) => [
      c.find('n').path,
      c.find('n').value,
      c.find('n').errors.map((e: any) => e.dataPath),
    ]),
});

describe('error routing by mode', () => {
  it.each([
    ['OnChange', ValidationMode.OnChange],
    ['OnRequest', ValidationMode.OnRequest],
  ])('%s insert0', async (_label, mode) => {
    const root = build(
      objArr,
      { arr: [{ n: 'aa' }, { n: 'b' }, { n: 'cc' }] },
      { validationMode: mode },
    );
    await root.validate();
    root.find('/arr').insert(0, { n: 'zz' });
    await new Promise((r) => setTimeout(r, 30));
    const after = dump(root);
    expect(after).toEqual({
      global: ['/arr/2/n'],
      items: [
        ['/arr/0/n', 'zz', []],
        ['/arr/1/n', 'aa', []],
        ['/arr/2/n', 'b', ['/arr/2/n']],
        ['/arr/3/n', 'cc', []],
      ],
    });
  });
});
