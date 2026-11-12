import * as React from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';

import { BootstrapProvider } from '../BootstrapProvider';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.doUnmock('react');
  vi.restoreAllMocks();
});

it("renders and settles another evaluated copy's alert through the existing provider", async () => {
  render(<BootstrapProvider />);
  // Both package copies must use the application's one React runtime.
  vi.doMock('react', () => React);
  vi.resetModules();
  const { alert } = await import('@/promise-modal/core/handle/utils/static');
  let result!: Promise<void>;
  act(() => {
    result = alert({ title: 'Another package copy' });
  });
  expect(screen.queryByText('Another package copy')).not.toBeNull();
  fireEvent.click(screen.getByText('Confirm'));
  await expect(result).resolves.toBeUndefined();
});
