import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { liveOptions, mountVirtualization } from './helpers/liveVirtualization';

const { observeFormRef } = vi.hoisted(() => ({ observeFormRef: vi.fn() }));

// Observe host refs through the real JSX runtime without importing form internals.
vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react/jsx-dev-runtime')>();
  return {
    ...actual,
    jsxDEV: (...args: Parameters<typeof actual.jsxDEV>) => {
      const [type, props] = args;
      if (type === 'form')
        observeFormRef((props as { ref?: unknown })?.ref ?? null);
      return actual.jsxDEV(...args);
    },
  };
});

describe.each([false, true])(
  'virtualization form ref (StrictMode=%s)',
  (strict) => {
    it('leaves a never-enabled form ref unattached and attaches it on enable', () => {
      const form = mountVirtualization(strict, false);
      const element = form.container.querySelector('form');
      expect(element).not.toBeNull();
      expect(observeFormRef).toHaveBeenLastCalledWith(null);
      act(() => form.ref.current!.findNode('/0')!.setValue('edited'));
      form.options(false);
      expect(observeFormRef.mock.calls.every(([ref]) => ref === null)).toBe(
        true,
      );

      form.options(liveOptions);
      expect(form.container.querySelector('form')).toBe(element);
      expect(observeFormRef).toHaveBeenLastCalledWith(
        expect.objectContaining({ current: element }),
      );

      form.options(false);
      expect(observeFormRef).toHaveBeenLastCalledWith(null);
    });
  },
);
