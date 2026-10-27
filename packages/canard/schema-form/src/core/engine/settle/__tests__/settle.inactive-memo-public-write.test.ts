import { afterEach, expect, it, vi } from 'vitest';

import * as navigation from '../../navigation';
import { engineModes } from '../../utils/cache/engineModes';
import { createInactiveMemoPublicTree } from './fixtures/createInactiveMemoPublicTree';

const previousMode = engineModes.inactiveValues;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('inactiveValues', previousMode);
});

it.each([8, 80, 256])(
  'bounds memo navigation for a public setValue switch across %i branches',
  (count) => {
    engineModes.setMode('inactiveValues', 'incremental');
    const root = createInactiveMemoPublicTree(count);
    const find = vi.spyOn(navigation, 'find');
    root.find('/kind')!.setValue(`kind_${count - 1}`);
    const unrelated = find.mock.calls.filter(
      ([, path]) =>
        typeof path === 'string' &&
        path.startsWith('/payload_') &&
        path !== '/payload_0' &&
        path !== `/payload_${count - 1}`,
    );
    expect(unrelated).toHaveLength(0);
    expect(root.find(`/payload_${count - 1}`)!.value).toBe(
      `value_${count - 1}`,
    );
    expect(root.inactiveValues[0]).toEqual({
      path: '/payload_0',
      value: 'value_0',
    });
  },
);
