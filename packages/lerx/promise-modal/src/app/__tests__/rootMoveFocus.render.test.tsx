import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { confirmHandler } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

const roots: HTMLElement[] = [];

afterEach(() => {
  cleanup();
  ModalManager.reset();
  for (const root of roots.splice(0)) root.remove();
});

it('keeps the focused control inside the pending dimmed modal when the root element changes', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  roots.push(first, second);
  document.body.append(first, second);
  const view = render(<BootstrapProvider root={first} />);
  act(() => {
    void confirmHandler({
      title: 't',
      content: (
        <>
          <button id="inside-first">inside-first</button>
          <input id="inside-input" />
        </>
      ),
      footer: false,
    });
  });
  (document.getElementById('inside-input') as HTMLElement).focus();
  view.rerender(<BootstrapProvider root={second} />);
  expect(second.contains(document.activeElement)).toBe(true);
  expect(document.activeElement?.id).toBe('inside-input');
});
