import { afterEach, expect, it, vi } from 'vitest';

import { isArray } from '@winglet/common-utils/filter';

import * as navigation from '../../navigation';
import { engineModes } from '../../utils/cache/engineModes';
import { createInactiveLazyTree } from './fixtures/createInactiveLazyTree';

const previousMode = engineModes.inactiveValues;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('inactiveValues', previousMode);
});

it.each([8, 80, 256])(
  'does not visit or materialize unrelated inactive entries on a public switch (%i branches)',
  (count) => {
    engineModes.setMode('inactiveValues', 'lazy');
    const { root } = createInactiveLazyTree(count);
    const find = vi.spyOn(navigation, 'find');
    const freeze = vi.spyOn(Object, 'freeze');
    const sort = vi.spyOn(Array.prototype, 'sort');
    root.find('/kind')!.setValue(`kind_${count - 1}`);
    const unrelated = find.mock.calls.filter(
      ([, path]) =>
        typeof path === 'string' &&
        path.startsWith('/payload_') &&
        path !== '/payload_0' &&
        path !== `/payload_${count - 1}`,
    );
    const lists = freeze.mock.calls.filter(
      ([value]) =>
        isArray(value) &&
        value.length > 0 &&
        value.every(
          (item) => item !== null && typeof item === 'object' && 'path' in item,
        ),
    );
    const memoSorts = sort.mock.instances.filter(
      (value) =>
        isArray(value) &&
        value.length > 0 &&
        value[0] !== null &&
        typeof value[0] === 'object' &&
        'entry' in value[0],
    );
    expect(unrelated).toHaveLength(0);
    expect(memoSorts).toHaveLength(0);
    expect(lists).toHaveLength(0);
    vi.restoreAllMocks();
    expect(root.inactiveValues[0]).toEqual({
      path: '/payload_0',
      value: 'value_0',
    });
    expect(Object.isFrozen(root.inactiveValues)).toBe(true);
  },
);
