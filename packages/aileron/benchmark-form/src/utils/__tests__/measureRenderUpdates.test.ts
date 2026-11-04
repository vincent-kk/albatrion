import { afterEach, expect, it, vi } from 'vitest';

import { measureRenderUpdates } from '../measureRenderUpdates';
import { settleUpdates } from '../settleUpdates';

vi.mock('../settleUpdates', () => ({ settleUpdates: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

it('separates synchronous work, settled elapsed time and the empty barrier floor', async () => {
  const clock = [0, 2, 10, 20, 23, 30, 34, 50, 60, 65];
  vi.spyOn(performance, 'now').mockImplementation(() => clock.shift()!);
  const setValue = vi.fn();
  const handle = {
    findNode: () => ({ value: 0, setValue, push: vi.fn(), remove: vi.fn() }),
    getValue: () => 0,
  };
  const result = await measureRenderUpdates(handle, [
    { kind: 'set', path: '/a', value: 1 },
    { kind: 'set', path: '/a', value: 2 },
  ]);
  expect(result).toEqual({
    'update-sync': 6,
    'update-settled': 30,
    'update-idle-floor': 8,
    'update-settled-net': 22,
  });
  expect(settleUpdates).toHaveBeenCalledTimes(4);
  expect(setValue.mock.calls).toEqual([[1], [2]]);
});

it('preserves a negative floor subtraction instead of clipping it', async () => {
  const clock = [0, 1, 2, 10, 15];
  vi.spyOn(performance, 'now').mockImplementation(() => clock.shift()!);
  const handle = {
    findNode: () => ({
      value: 0,
      setValue: vi.fn(),
      push: vi.fn(),
      remove: vi.fn(),
    }),
    getValue: () => 0,
  };
  const result = await measureRenderUpdates(handle, [
    { kind: 'set', path: '/a', value: 1 },
  ]);
  expect(result['update-settled-net']).toBe(-3);
});
