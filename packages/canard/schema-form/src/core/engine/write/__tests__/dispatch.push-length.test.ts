import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

import { dispatchPush } from '../utils/entry/dispatchPush';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

describe('push returns the array length after the call', () => {
  it('returns the unchanged length when listener feedback refuses the push', () => {
    const { root } = createDispatchTree(
      { type: 'array', items: { type: 'number' } },
      undefined,
      undefined,
      { hasConsumer: () => true, report: vi.fn() },
    );
    const calls: { returned: unknown; length: number }[] = [];
    subscribeFieldNode(root, () => {
      if (calls.length >= 30) return;
      const before = root.itemCount;
      calls.push({ returned: dispatchPush(root, 0), length: before });
    });
    expect(() => dispatchPush(root, 0)).toThrow();
    const refused = calls.filter((call) => call.returned !== call.length + 1);
    expect(refused.length).toBeGreaterThan(0);
    for (const call of refused) expect(call.returned).toBe(call.length);
  });

  it('returns the unchanged length when a nested push fails and the outer chain throws', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        list: { type: 'array', items: { type: 'number' } },
        name: { type: 'string' },
      },
    });
    dispatchSetValue(root, { list: [], name: '' });
    const name = getDispatchChild(root, 'name');
    let returned: unknown = 'not called';
    runtime.onChange = () => {
      if (returned !== 'not called') return;
      returned = dispatchPush(name, 'x');
    };
    expect(() => dispatchPush(getDispatchChild(root, 'list'), 1)).toThrow();
    expect(returned).toBe(0);
  });
});
