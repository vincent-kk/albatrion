import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * r5-release, angle CA3 (documented environments against the runtime APIs the build uses).
 *
 * README.md "Compatibility" lists Node.js 14.0.0 or higher. Node 14 has no global
 * `AbortController` (it became a global in Node 15.0.0; Node 14.17 offers it only behind
 * `--experimental-abortcontroller`). `withTimeout` constructs one unconditionally
 * (dist/utils/promise/withTimeout.mjs:9), after it has already started `fn`.
 * The probe removes the global the way a Node 14 process lacks it and imports the package
 * by name, which resolves to the `dist` built at the base commit.
 */
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('r5-release withTimeout on Node.js 14 (no global AbortController)', () => {
  it('withTimeout settles with the function result where AbortController is not a global', async () => {
    const { withTimeout } = await import('@winglet/common-utils/promise');
    vi.stubGlobal('AbortController', undefined);
    const started: string[] = [];
    const outcome = await (async () => {
      try {
        return await withTimeout(async () => {
          started.push('fn');
          return 'done';
        }, 1000);
      } catch (error) {
        return `threw ${(error as Error).name}: ${(error as Error).message}`;
      }
    })();
    expect({ outcome, started }).toEqual({ outcome: 'done', started: ['fn'] });
  });

  it('control: timeout and delay, which take an optional signal, work without the global', async () => {
    const { delay } = await import('@winglet/common-utils/promise');
    vi.stubGlobal('AbortController', undefined);
    await expect(delay(1)).resolves.toBeUndefined();
  });

  it('control: withTimeout settles with the function result where AbortController exists', async () => {
    const { withTimeout } = await import('@winglet/common-utils/promise');
    await expect(withTimeout(async () => 'done', 1000)).resolves.toBe('done');
  });
});
