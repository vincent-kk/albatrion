import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';

import {
  useConfigurationBackdrop,
  useConfigurationOptions,
} from '@/promise-modal/providers';

import { useDestroyAfter } from '../useDestroyAfter';
import { useModalDuration } from '../useModalDuration';

it.each([
  ['useModalOptions', () => useConfigurationOptions()],
  ['useModalBackdrop', () => useConfigurationBackdrop()],
  ['useModalDuration', () => useModalDuration()],
  ['useDestroyAfter', () => useDestroyAfter(0, 10)],
] as const)('explains where %s must be called', (name, hook) => {
  expect(() => renderHook(() => hook())).toThrow(
    new RegExp(`${name}.*(frame|content|footer)`, 'i'),
  );
});
