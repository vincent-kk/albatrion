import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.resetModules());

it.each([0, 1, 2])(
  '(round-2 promise-modal 7) shares context identity %s across compatible copies',
  async (index) => {
    const first = await Promise.all([
      import('../ConfigurationContext/ConfigurationContext'),
      import('../ModalManagerContext/ModalManagerContext'),
      import('../UserDefinedContext/UserDefinedContext'),
    ]);
    vi.resetModules();
    const second = await Promise.all([
      import('../ConfigurationContext/ConfigurationContext'),
      import('../ModalManagerContext/ModalManagerContext'),
      import('../UserDefinedContext/UserDefinedContext'),
    ]);
    const firstContexts = [
      first[0].ConfigurationContext,
      first[1].ModalManagerContext,
      first[2].UserDefinedContext,
    ];
    const secondContexts = [
      second[0].ConfigurationContext,
      second[1].ModalManagerContext,
      second[2].UserDefinedContext,
    ];
    expect(secondContexts[index]).toBe(firstContexts[index]);
  },
);
