import { afterEach, expect, it, vi } from 'vitest';
import { destroyScope, styleManagerFactory } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

const cases = [
  ['block', '.a{x:y', '}'],
  ['comment', '.a{x:y}/* todo}', '*/'],
  ['string', '.a{content:"abc}', '"}'],
  ['string trailing escape', '.a{content:"abc\\', '\n"}'],
  ['url', '.a{background:url(x', ')}'],
  ['url trailing escape', '.a{background:url(x\\', '\uFFFD)}'],
  ['parenthesis', '.a{width:calc(1px', ')}'],
  ['bracket', '.a{--x:[one', ']}'],
  ['at-rule prelude', '@media (x)', ';'],
  ['nested block', '@media (x){.a{x:y', '}}'],
];

afterEach(() => vi.unstubAllGlobals());
for (const [name, first, closure] of cases)
  for (const compressed of [false, true])
    it(`round-4 EOF isolation ${name}, skip compression=${compressed}`, () => {
      const callbacks: FrameRequestCallback[] = [];
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callbacks.push(callback));
      vi.stubGlobal('cancelAnimationFrame', () => {});
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      const add = styleManagerFactory('eof', { shadowRoot: shadow });
      const next = '.b{color:blue}';
      add('first', first, compressed); add('next', next, compressed);
      callbacks.forEach(callback => callback(0));
      const css = shadow.querySelector('style')?.textContent ?? '';
      expect(normalizeCss(css)).toEqual(normalizeCss(first + closure + '\n' + next));
      destroyScope('eof', { shadowRoot: shadow });
    });
