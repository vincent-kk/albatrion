import { afterEach, expect, it } from 'vitest';

import { getTabbableElements } from '../getTabbableElements';

afterEach(() => {
  document.body.innerHTML = '';
});

/** Builds a frame with a light control followed by a host holding two shadow buttons. */
const buildFrame = (hostWrapper = '') => {
  const frame = document.createElement('div');
  frame.innerHTML = `<button id="light">light</button><div ${hostWrapper}><span id="host"></span></div><button id="after">after</button>`;
  document.body.append(frame);
  const root = frame.querySelector('#host')!.attachShadow({ mode: 'open' });
  root.innerHTML = '<button id="s1">s1</button><button id="s2">s2</button>';
  return frame;
};

it('splices open shadow root controls in at the host position', () => {
  expect(getTabbableElements(buildFrame()).map((element) => element.id)).toEqual([
    'light',
    's1',
    's2',
    'after',
  ]);
});

it('excludes shadow root controls under a hidden light ancestor', () => {
  expect(
    getTabbableElements(buildFrame('hidden')).map((element) => element.id),
  ).toEqual(['light', 'after']);
});
