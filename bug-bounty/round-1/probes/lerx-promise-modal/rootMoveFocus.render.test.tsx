import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { ModalProvider, confirm } from '@/promise-modal';

const roots: HTMLElement[] = [];
afterEach(() => {
  cleanup();
  ModalManager.reset();
  for (const root of roots.splice(0)) root.remove();
});

it('keeps focus inside the pending dimmed modal when the root element changes', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  roots.push(first, second);
  document.body.append(first, second);
  const view = render(<ModalProvider root={first} />);
  act(() => {
    void confirm({
      title: 't',
      content: <button id="inside">inside</button>,
      footer: false,
    });
  });
  expect(document.activeElement?.id).toBe('inside');
  view.rerender(<ModalProvider root={second} />);
  // Contract: moving the anchor preserves the modal; the modal is still the
  // top dimmed participant, so focus must not be left on <body> (the page is
  // inert, so Escape-free keyboard users have no focused target).
  expect(second.contains(document.activeElement)).toBe(true);
});
