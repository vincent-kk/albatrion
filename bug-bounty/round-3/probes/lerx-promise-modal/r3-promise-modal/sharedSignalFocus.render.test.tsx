import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    .closest('[tabindex="-1"]') as HTMLElement;
  // Focus moved into the outer modal; the nested request is opened from there.
  expect(outerFrame.contains(document.activeElement)).toBe(true);
  act(() => {
    void confirm({ title: 'Nested', signal });
  });
  const nestedId = ModalManager.ids.find((id) => id !== outerId)!;
  return { opener, outerId, nestedId };
};

it('returns focus to the page opener after one shared signal cancels a nested stack', async () => {
  const controller = new AbortController();
  const { opener, outerId, nestedId } = openNested(controller.signal);
  await act(async () => controller.abort());
  expect(ModalManager.node(outerId)?.settled ?? true).toBe(true);
  expect(ModalManager.node(nestedId)?.settled ?? true).toBe(true);
  await wait(400);
  expect(ModalManager.ids.length).toBe(0);
  // SPECIFICATION: one signal can cancel several requests; focus should return to
  // the page control that opened the stack, as it does when they close top-down.
  expect(document.activeElement).toBe(opener);
});

it('control: returns focus to the page opener when the stack closes top-down', async () => {
  const { opener } = openNested();
  const cancel = () => screen.getAllByText('Cancel');
  await act(async () => fireEvent.click(cancel()[cancel().length - 1]));
  await act(async () => fireEvent.click(cancel()[0]));
  await wait(400);
  expect(ModalManager.ids.length).toBe(0);
  expect(document.activeElement).toBe(opener);
});
