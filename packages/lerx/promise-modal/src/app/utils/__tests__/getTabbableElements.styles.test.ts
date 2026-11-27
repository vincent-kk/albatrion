import { afterEach, expect, it, vi } from 'vitest';

import { getTabbableElements } from '../getTabbableElements';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

it('reads each shared ancestor style once during a keyboard-target search', () => {
  document.body.innerHTML = `
    <div id="frame"><div id="group">
      <button id="first">First</button><button id="second">Second</button>
    </div></div>`;
  const frame = document.getElementById('frame')!;
  const group = document.getElementById('group')!;
  const readStyle = vi.spyOn(window, 'getComputedStyle');

  expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
    'first',
    'second',
  ]);
  expect(
    readStyle.mock.calls.filter(([element]) => element === group),
  ).toHaveLength(1);
  expect(
    readStyle.mock.calls.filter(([element]) => element === frame),
  ).toHaveLength(1);
});

it('reads styles again after an ancestor display or visibility changes', () => {
  document.body.innerHTML =
    '<div id="frame"><div id="group"><button>First</button><button>Second</button></div></div>';
  const frame = document.getElementById('frame')!;
  const group = document.getElementById('group')!;
  expect(getTabbableElements(frame)).toHaveLength(2);

  group.style.display = 'none';
  expect(getTabbableElements(frame)).toEqual([]);
  group.style.display = '';
  expect(getTabbableElements(frame)).toHaveLength(2);
  group.style.visibility = 'hidden';
  expect(getTabbableElements(frame)).toEqual([]);
  group.style.visibility = 'visible';
  expect(getTabbableElements(frame)).toHaveLength(2);
});

it('keeps hidden and visible sibling branches independent', () => {
  document.body.innerHTML = `
    <div id="frame">
      <div style="visibility: hidden"><button>Hidden first</button><button>Hidden second</button></div>
      <div><button id="visible">Visible</button></div>
    </div>`;

  expect(
    getTabbableElements(document.getElementById('frame')!).map(
      (element) => element.id,
    ),
  ).toEqual(['visible']);
});
