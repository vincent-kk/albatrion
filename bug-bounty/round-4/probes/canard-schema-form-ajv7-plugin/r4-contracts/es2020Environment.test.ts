import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Imports the entry in a host that has ES2020 but not the ES2021 WeakRef and
 * FinalizationRegistry globals, as Safari 14.0 (iOS 14.0 to 14.4) does.
 */
const importWithoutWeakRefs = async () => {
  vi.resetModules();
  vi.stubGlobal('FinalizationRegistry', undefined);
  vi.stubGlobal('WeakRef', undefined);
  try {
    await import('../../index');
    return 'loaded';
  } catch (error) {
    return `threw ${(error as Error).name}: ${(error as Error).message}`;
  }
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('r4-contracts ajv7 plugin in a documented ES2020 browser', () => {
  it('control: the entry loads where the ES2021 globals exist', async () => {
    vi.resetModules();
    await expect(import('../../index')).resolves.toBeDefined();
  });

  it('the entry loads in an ES2020 host without WeakRef and FinalizationRegistry (README: Safari 14+)', async () => {
    expect(await importWithoutWeakRefs()).toBe('loaded');
  });
});
