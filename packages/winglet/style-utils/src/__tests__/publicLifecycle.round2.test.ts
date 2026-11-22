import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { destroyScope, styleManagerFactory } from '../index';

const flush = () => vi.advanceTimersByTime(20);
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.head.innerHTML = '';
});

describe('round-2 style-utils 1: target-specific release', () => {
  it('releases shadow styles like document styles without touching another root', () => {
    const first = document.createElement('div').attachShadow({ mode: 'open' });
    const second = document.createElement('div').attachShadow({ mode: 'open' });
    styleManagerFactory('release')('x', '.a { color: red; }');
    styleManagerFactory('release', { shadowRoot: first })(
      'x',
      '.a { color: red; }',
    );
    styleManagerFactory('release', { shadowRoot: second })(
      'x',
      '.a { color: red; }',
    );
    flush();
    destroyScope('release');
    const documentCount = document.querySelectorAll('style.release').length;
    // Reflect.apply reaches the optional API on the RED implementation as well.
    Reflect.apply(destroyScope, undefined, ['release', { shadowRoot: first }]);
    expect(first.querySelectorAll('style').length).toBe(documentCount);
    expect(second.querySelectorAll('style').length).toBe(1);
    Reflect.apply(destroyScope, undefined, ['release', { shadowRoot: second }]);
  });
});

describe('round-2 style-utils 2: injector generations', () => {
  it('releases a reused injector like a newly created injector', () => {
    const reused = styleManagerFactory('reused');
    reused('x', '.a{color:red}');
    flush();
    destroyScope('reused');
    reused('x', '.a{color:blue}');
    flush();
    destroyScope('reused');
    styleManagerFactory('fresh')('x', '.a{color:blue}');
    flush();
    destroyScope('fresh');
    expect(document.querySelectorAll('style.reused').length).toBe(
      document.querySelectorAll('style.fresh').length,
    );
  });
  it('keeps old cleanup bound to its generation like an independent scope cleanup', () => {
    const inject = styleManagerFactory('generation');
    const oldCleanup = inject('same', '.a{color:red}');
    flush();
    destroyScope('generation');
    const newCleanup = inject('same', '.a{color:blue}');
    flush();
    const oldOther = styleManagerFactory('other-old')('same', '.a{color:red}');
    flush();
    destroyScope('other-old');
    styleManagerFactory('other-new')('same', '.a{color:blue}');
    flush();
    oldCleanup();
    oldOther();
    flush();
    expect(
      document.querySelector('style.generation')?.textContent?.includes('blue'),
    ).toBe(
      document.querySelector('style.other-new')?.textContent?.includes('blue'),
    );
    newCleanup();
    destroyScope('generation');
    destroyScope('other-new');
  });
});
