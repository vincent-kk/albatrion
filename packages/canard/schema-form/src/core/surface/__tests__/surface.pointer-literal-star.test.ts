import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('addresses a literal star separately from wildcard queries through branch exit and AJV routing', async () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      branch: {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: {
          kind: { type: 'string' },
          sibling: { type: 'string' },
        },
        oneOf: [
          {
            properties: {
              kind: { const: 'star' },
              '*': {
                type: 'string',
                minLength: 3,
                controls: { unsetOnInactive: false },
              },
            },
          },
          { properties: { kind: { const: 'other' } } },
        ],
      },
    },
  });
  root.setValue({ branch: { kind: 'star', '*': 'x', sibling: 'live' } });
  const star = root.find('/branch/%2A');
  expect(star?.name).toBe('*');
  expect(star?.path).toBe('/branch/%2A');
  expect(root.findNodes('/branch/*')).toContain(star);
  expect(root.findNodes('/branch/*').map((node) => node.name)).toContain(
    'sibling',
  );
  await root.validate();
  expect(star?.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        keyword: 'minLength',
        dataPath: '/branch/%2A',
      }),
    ]),
  );
  expect(root.find('/branch/sibling')?.errors).toEqual([]);
  root.find('/branch/kind')!.setValue('other');
  expect(root.find('/branch/%2A')).toBeNull();
  expect(root.find('/branch/sibling')?.value).toBe('live');
  expect(root.inactiveValues).toEqual(
    expect.arrayContaining([{ path: '/branch/%2A', value: 'x' }]),
  );
});
