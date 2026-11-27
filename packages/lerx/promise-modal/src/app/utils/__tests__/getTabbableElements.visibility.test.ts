import { afterEach, expect, it } from 'vitest';

import { getTabbableElements } from '../getTabbableElements';

afterEach(() => {
  document.body.innerHTML = '';
});

it.each([
  [
    'restored descendant',
    'style="visibility:hidden"',
    'visibility:visible',
    true,
  ],
  ['hidden candidate', '', 'visibility:hidden', false],
  ['collapsed candidate', '', 'visibility:collapse', false],
  ['inherited hidden value', 'style="visibility:hidden"', '', false],
  ['inherited collapse value', 'style="visibility:collapse"', '', false],
  [
    'hidden display ancestor',
    'style="display:none"',
    'visibility:visible',
    false,
  ],
  ['hidden attribute ancestor', 'hidden', 'visibility:visible', false],
  ['inert ancestor', 'inert', 'visibility:visible', false],
] as const)(
  'uses effective candidate visibility for %s',
  (_name, attributes, visibility, expected) => {
    document.body.innerHTML = `<div id="frame"><div ${attributes}><button id="target" style="${visibility}">Target</button></div></div>`;

    expect(
      getTabbableElements(document.getElementById('frame')!).map(
        (element) => element.id,
      ),
    ).toEqual(expected ? ['target'] : []);
  },
);
