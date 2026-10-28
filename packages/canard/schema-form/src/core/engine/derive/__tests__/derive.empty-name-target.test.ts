import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('targets an empty-name child from a oneOf fragment and preserves its object host', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: { source: { type: 'string' } },
    oneOf: [
      {
        properties: { '': { type: 'string' } },
        controls: { derived: './source' },
      },
    ],
  });
  root.setValue({ source: 'initial' });
  expect(root.value).toEqual({ source: 'initial', '': 'initial' });
  root.find('/source')!.setValue('updated');
  expect(root.find('/')!.value).toBe('updated');
  expect(root.value).toEqual({ source: 'updated', '': 'updated' });
});
