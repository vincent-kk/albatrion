import { afterEach, expect, it } from 'vitest';

import { getTabbableElements } from '../getTabbableElements';

afterEach(() => {
  document.body.innerHTML = '';
});

/** jsdom never makes editing hosts focusable; emulate the browser's tabIndex 0. */
const emulateEditableTabIndex = (root: HTMLElement) => {
  for (const element of root.querySelectorAll<HTMLElement>('[contenteditable]'))
    Object.defineProperty(element, 'tabIndex', {
      configurable: true,
      get: () => 0,
    });
};

it.each(['', 'true', 'TRUE', 'plaintext-only', 'PLAINTEXT-ONLY'])(
  'treats contenteditable="%s" as a sequential focus target',
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

it.each(['false', 'FALSE'])(
  'does not treat contenteditable="%s" as a focus target by itself',
  (value) => {
    const frame = document.createElement('div');
    frame.innerHTML = `<button id="first">first</button><div id="editor" contenteditable="${value}">x</div>`;
    document.body.append(frame);
    emulateEditableTabIndex(frame);
    expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
      'first',
    ]);
  },
);
