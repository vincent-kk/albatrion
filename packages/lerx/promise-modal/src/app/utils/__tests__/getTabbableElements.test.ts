import { expect, it, vi } from 'vitest';

import { getTabbableElements } from '../getTabbableElements';

it('orders mixed tabindex ranks stably and compares equal ranks with zero', () => {
  const frame = document.createElement('div');
  frame.innerHTML = `
    <button id="zero-first">zero first</button>
    <button id="positive-three-first" tabindex="3">three first</button>
    <button id="positive-one" tabindex="1">one</button>
    <button id="zero-second" tabindex="0">zero second</button>
    <button id="positive-three-second" tabindex="3">three second</button>
  `;
  document.body.append(frame);
  const sort = vi.spyOn(Array.prototype, 'sort');
  try {
    const targets = getTabbableElements(frame);
    const compare = sort.mock.lastCall?.[0];
    expect(targets.map((target) => target.id)).toEqual([
      'positive-one',
      'positive-three-first',
      'positive-three-second',
      'zero-first',
      'zero-second',
    ]);
    expect(compare?.(targets[3], targets[4])).toBe(0);
    expect(compare?.(targets[1], targets[2])).toBe(0);
  } finally {
    sort.mockRestore();
    frame.remove();
  }
});
