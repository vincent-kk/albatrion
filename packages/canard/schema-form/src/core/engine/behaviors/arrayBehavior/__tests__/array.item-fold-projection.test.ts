import { expect, it } from 'vitest';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount, writeFieldNode } from '../../../settle';
import { FieldNodeWriteKind, WriteOption } from '../../../types/value';

it.each(['items', 'prefixItems'] satisfies readonly (
  | 'items'
  | 'prefixItems'
)[])('%s fills from the live object fold and trims its null', (keyword) => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      later: { type: 'boolean' },
      list: {
        type: 'array',
        options: { omitTrailingEmpty: true },
        allOf: [
          {
            controls: { active: '!../later' },
            [keyword]:
              keyword === 'items' ? { type: 'string' } : [{ type: 'string' }],
          },
          {
            controls: { active: '../later' },
            [keyword]:
              keyword === 'items' ? { type: 'object' } : [{ type: 'object' }],
          },
        ],
      },
    },
  });
  loadFieldNodeAtMount(
    root,
    { later: true, list: [{}] },
    WriteOption.Overwrite,
  );
  const list = root.__childrenByName__!.list;
  expect(list.__value__).toEqual([{}]);
  expect(list.__outputValue__).toBeUndefined();
  writeFieldNode(
    list.__childrenByName__!['0'],
    null,
    FieldNodeWriteKind.CallerReplace,
    WriteOption.Overwrite,
  );
  expect(list.__outputValue__).toBeUndefined();
});
