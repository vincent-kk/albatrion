import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import { ValidationMode } from '../../../types/state';

const schema = {
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

const build = (validationMode?: ValidationMode) =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { arr: [{ n: 'aa' }, { n: 'b' }, { n: 'cc' }] },
    validator: createTestValidator(),
    validationMode,
  } as never) as any;

/** Global issue paths and, per item, its path, value and own issue paths. */
const dump = (root: any) => ({
  global: (root.globalErrors ?? []).map((issue: any) => issue.dataPath),
  items: root
    .find('/arr')
    .children.map((item: any) => [
      item.find('n').path,
      item.find('n').value,
      item.find('n').errors.map((issue: any) => issue.dataPath),
    ]),
});

describe('validation issue paths after array moves without revalidation', () => {
  it.each([ValidationMode.OnRequest, undefined])(
    'mode %s: insert at 0 moves the issue path with its node',
    async (mode) => {
      const root = build(mode);
      await root.validate();
      root.find('/arr').insert(0, { n: 'zz' });
      expect(dump(root)).toEqual({
        global: ['/arr/2/n'],
        items: [
          ['/arr/0/n', 'zz', []],
          ['/arr/1/n', 'aa', []],
          ['/arr/2/n', 'b', ['/arr/2/n']],
          ['/arr/3/n', 'cc', []],
        ],
      });
    },
  );

  it('insert in the middle moves only the issues behind the insertion', async () => {
    const root = build(ValidationMode.OnRequest);
    await root.validate();
    root.find('/arr').insert(1, { n: 'zz' });
    expect(dump(root).global).toEqual(['/arr/2/n']);
    expect(root.find('/arr/2/n').errors.map((e: any) => e.dataPath)).toEqual([
      '/arr/2/n',
    ]);
  });

  it('remove before the invalid item moves its issue path back', async () => {
    const root = build(ValidationMode.OnRequest);
    await root.validate();
    root.find('/arr').remove(0);
    expect(dump(root)).toEqual({
      global: ['/arr/0/n'],
      items: [
        ['/arr/0/n', 'b', ['/arr/0/n']],
        ['/arr/1/n', 'cc', []],
      ],
    });
  });

  it('removing the invalid item drops its issue from the form list', async () => {
    const root = build(ValidationMode.OnRequest);
    await root.validate();
    root.find('/arr').remove(1);
    expect(dump(root).global).toEqual([]);
  });
});
