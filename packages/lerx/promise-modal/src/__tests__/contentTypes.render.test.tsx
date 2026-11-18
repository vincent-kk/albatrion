import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, alert, confirm, prompt } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

it('(round-2 promise-modal 4) control: element and string content render', () => {
  render(<ModalProvider />);
  act(() => {
    void alert({ title: 't', content: <p>element body</p> });
    void alert({ title: 't2', content: 'string body' });
  });
  expect(screen.getByText('element body')).toBeDefined();
  expect(screen.getByText('string body')).toBeDefined();
});

it('(round-2 promise-modal 4) renders numeric ReactNode content (alert)', () => {
  render(<ModalProvider />);
  act(() => {
    void alert({ title: 'Count', content: 42 });
  });
  expect(screen.queryByText('42')).not.toBeNull();
});

it('(round-2 promise-modal 4) renders array ReactNode content (confirm)', () => {
  render(<ModalProvider />);
  act(() => {
    void confirm({
      title: 'List',
      content: [<p key="a">first line</p>, <p key="b">second line</p>],
    });
  });
  expect(screen.queryByText('first line')).not.toBeNull();
});

it('(round-2 promise-modal 4) renders numeric ReactNode content (prompt)', () => {
  render(<ModalProvider />);
  act(() => {
    void prompt<string>({
      title: 'Prompt',
      content: 7,
      Input: () => <input aria-label="v" />,
    });
  });
  expect(screen.queryByText('7')).not.toBeNull();
});
