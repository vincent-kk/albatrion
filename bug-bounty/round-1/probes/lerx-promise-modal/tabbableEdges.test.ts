import { afterEach, expect, it } from 'vitest';

import { getTabbableElements } from '@/promise-modal/app/utils/getTabbableElements';

afterEach(() => {
  document.body.innerHTML = '';
});

/** jsdom has no contenteditable focusability; emulate the browser's tabIndex 0. */
const emulateEditableTabIndex = (root: HTMLElement) => {
  for (const element of root.querySelectorAll<HTMLElement>('[contenteditable]'))
    Object.defineProperty(element, 'tabIndex', { configurable: true, get: () => 0 });
};

it.each(['', 'plaintext-only', 'TRUE'])(
  'treats contenteditable="%s" as a sequential focus target like the browser',
  (value) => {
    const frame = document.createElement('div');
    frame.innerHTML = `<button id="first">first</button><div id="editor" contenteditable="${value}">x</div>`;
    document.body.append(frame);
    emulateEditableTabIndex(frame);
    expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
      'first',
      'editor',
    ]);
  },
);

it('treats contenteditable="true" as a sequential focus target (control case)', () => {
  const frame = document.createElement('div');
  frame.innerHTML = '<button id="first">first</button><div id="editor" contenteditable="true">x</div>';
  document.body.append(frame);
  emulateEditableTabIndex(frame);
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual(['first', 'editor']);
});
