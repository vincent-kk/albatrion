import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

const wait = (milliseconds: number) =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));

/** Opens a dimmed confirm from the page and a nested one from inside it, sharing a signal. */
const openNested = (signal?: AbortSignal) => {
  render(
    <ModalProvider>
      <button>Review</button>
    </ModalProvider>,
  );
  const opener = screen.getByText('Review');
  opener.focus();
  act(() => {
    void confirm({ title: 'Outer', signal });
  });
  const [outerId] = ModalManager.ids;
  const outerFrame = screen
    .getByText('Outer')
    .closest<HTMLElement>('[tabindex="-1"]')!;
  // Focus moved into the outer modal; the nested request is opened from there.
  expect(outerFrame.contains(document.activeElement)).toBe(true);
  act(() => {
    void confirm({ title: 'Nested', signal });
  });
  const nestedId = ModalManager.ids.find((id) => id !== outerId)!;
  return { opener, outerId, nestedId };
};

it('one signal and top-down settlement return focus to the same connected page opener', async () => {
  const results: boolean[] = [];
  for (const shared of [false, true]) {
    const controller = new AbortController();
    const { opener, outerId, nestedId } = openNested(
      shared ? controller.signal : undefined,
    );
    if (shared) await act(async () => controller.abort());
    else {
      const cancel = () => screen.getAllByText('Cancel');
      await act(async () => fireEvent.click(cancel().at(-1)!));
      await act(async () => fireEvent.click(cancel()[0]));
    }
    expect(ModalManager.node(outerId)?.settled ?? true).toBe(true);
    expect(ModalManager.node(nestedId)?.settled ?? true).toBe(true);
    await wait(400);
    expect(ModalManager.ids).toHaveLength(0);
    results.push(document.activeElement === opener);
    cleanup();
    ModalManager.reset();
  }
  expect(results[0]).toBe(true);
  expect(results[1]).toBe(results[0]);
});
