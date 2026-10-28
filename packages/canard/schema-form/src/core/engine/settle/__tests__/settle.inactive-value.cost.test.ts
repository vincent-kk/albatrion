import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import * as resolution from '../utils/inactive/resolveInactiveValue';

it.each([false, true])('does not enter the resolver path for an unconfigured exit (other node configured=%s)', (otherConfigured) => {
  const resolve = vi.spyOn(resolution, 'resolveInactiveValue');
  try {
    const { root } = makeFieldNodeTree({
      type: 'object', properties: {
        open: { type: 'boolean' },
        stable: { type: 'string', controls: otherConfigured ? { inactiveValue: 'stable' } : undefined },
        value: { type: 'string', controls: { active: '../open' } },
      },
    });
    root.setValue({ open: true, value: 'before' });
    if (otherConfigured) root.find('/stable')!.onInactive(() => 'stable');
    root.find('/open')!.setValue(false);
    expect(resolve).not.toHaveBeenCalled();
    expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
  } finally {
    resolve.mockRestore();
  }
});
