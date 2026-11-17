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

it('keeps a shadow radio that shares a name with a light radio, since groups are per tree', () => {
  const frame = document.createElement('div');
  frame.innerHTML = '<input type="radio" name="g" id="light"><span id="host"></span>';
  document.body.append(frame);
  const root = frame.querySelector('#host')!.attachShadow({ mode: 'open' });
  root.innerHTML = '<input type="radio" name="g" id="shadow">';
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
    'light',
    'shadow',
  ]);
});

it('drops a light child of a shadow host that no slot renders', () => {
  const frame = document.createElement('div');
  frame.innerHTML =
    '<button id="before">before</button><span id="host"><button id="ghost">ghost</button></span>';
  document.body.append(frame);
  const root = frame.querySelector('#host')!.attachShadow({ mode: 'open' });
  root.innerHTML = '<button id="inner">inner</button>';
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
    'before',
    'inner',
  ]);
});
