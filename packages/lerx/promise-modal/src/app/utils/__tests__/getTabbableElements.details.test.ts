import { afterEach, expect, it } from 'vitest';

import { getTabbableElements } from '../getTabbableElements';

afterEach(() => {
  document.body.innerHTML = '';
});

it('keeps only the first direct summary subtree in closed details', () => {
  document.body.innerHTML = `
    <div id="frame">
      <button id="first">First</button>
      <details tabindex="0" id="details">
        <summary id="summary">More <button id="summary-button">Action</button></summary>
        <summary tabindex="0" id="extra-summary">Hidden summary</summary>
        <button id="hidden">Hidden</button>
      </details>
    </div>`;
  const frame = document.getElementById('frame')!;
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
    'first',
    'details',
    'summary',
    'summary-button',
  ]);
});

it('includes content after details opens and excludes it after it closes', () => {
  document.body.innerHTML =
    '<details open><summary id="summary">More</summary><button id="content">Content</button></details>';
  expect(
    getTabbableElements(document.body).map((element) => element.id),
  ).toEqual(['summary', 'content']);
  document.querySelector('details')!.open = false;
  expect(
    getTabbableElements(document.body).map((element) => element.id),
  ).toEqual(['summary']);
});

it('does not expose an open nested details inside a closed outer details', () => {
  document.body.innerHTML =
    '<details><summary id="outer">Outer</summary><details open><summary>Inner</summary><button>Hidden</button></details></details>';
  expect(
    getTabbableElements(document.body).map((element) => element.id),
  ).toEqual(['outer']);
});

it('excludes closed details content when no summary is present', () => {
  document.body.innerHTML = '<details><button>Hidden</button></details>';
  expect(getTabbableElements(document.body)).toEqual([]);
});
