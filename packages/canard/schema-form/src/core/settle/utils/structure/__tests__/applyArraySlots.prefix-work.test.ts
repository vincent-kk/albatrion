import { afterEach, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../../../types/value';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { arrangeSchemaNodeItems, writeSchemaNode } from '../../../index';
import * as rawTree from '../../latent/readRawTree';

afterEach(() => vi.restoreAllMocks());

it('does not rebuild retained raw item trees for append or remove-last', () => {
  const { root } = createTestTree({
    type: 'array',
    items: { type: 'object', properties: { value: { type: 'string' } } },
  });
  writeSchemaNode(
    root,
    [{ value: 'a' }, { value: 'b' }],
    'callerReplace',
    SetValueOption.Overwrite,
  );
  const read = vi.spyOn(rawTree, 'readRawTree');
  expect(
    arrangeSchemaNodeItems(root, { kind: 'push', value: { value: 'c' } }),
  ).toBe(3);
  expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toEqual({ value: 'c' });
  expect(root.local).toEqual([{ value: 'a' }, { value: 'b' }]);
  expect(read).not.toHaveBeenCalled();
});
