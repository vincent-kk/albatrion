import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../../index';
import { n1, toks } from './oracle';

const flush = () => vi.advanceTimersByTime(20);

/** Preludes of the top-level rules, whitespace collapsed, comments dropped. */
const topLevelPreludes = (css: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let prelude = '';
  for (const t of toks(css)) {
    if (t[0] === 'comment') continue;
    if (t[0] === '{-token') {
      if (depth === 0) out.push(prelude.replace(/\s+/g, ' ').trim());
      depth++;
      continue;
    }
    if (t[0] === '}-token') {
      depth--;
      if (depth === 0) prelude = '';
      continue;
    }
    if (depth === 0) prelude += t[0] === 'semicolon-token' ? '' : t[1];
    if (depth === 0 && t[0] === 'semicolon-token') prelude = '';
  }
  return out;
};

describe('r4 style-utils public API', () => {
  describe('compressCss: a comment that is the only boundary right after a CSS escape', () => {
    it('SA1 keeps the token boundary between a hex escape and the next name character', () => {
      const css = '.h\\31/**/x{color:red}';
      expect(n1(compressCss(css))).toEqual(n1(css));
    });
    it('SA2 keeps the code point of a hex escape followed by a comment and a hex digit', () => {
      const css = '.a{content:"";margin:\\31/**/2px}';
      expect(n1(compressCss(css))).toEqual(n1(css));
    });
    it('SA3 keeps the boundary after a non-hex escape', () => {
      const css = '.md\\:/**/flex{display:flex}';
      expect(n1(compressCss(css))).toEqual(n1(css));
    });
    it('SA0 control: the same comment after a plain letter is kept as /**/', () => {
      const css = '.h1/**/x{color:red}';
      expect(n1(compressCss(css))).toEqual(n1(css));
    });
  });

  describe('compressCss: a parenthesis inside a string in a math function', () => {
    it('SD1 keeps the spaces calc() needs around + when a string before it holds ")"', () => {
      const css = '.a{width:calc(var(--a, ")") + 2px)}';
      expect(compressCss(css)).toContain(' + 2px');
    });
    it('SD0 control: without the string the spaces stay', () => {
      expect(compressCss('.a{width:calc(var(--a, 1px) + 2px)}')).toContain(' + 2px');
    });
  });

  describe('styleManagerFactory: one style id with an unclosed block', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('SB1 in a shadow root, a missing closing brace in one style id does not swallow the next style id', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const add = styleManagerFactory('r4unclosed', { shadowRoot });
      add('a', '.a { color: red; ');
      add('b', '.b { color: blue; }');
      flush();
      const text = Array.from(shadowRoot.querySelectorAll('style'))
        .map((e) => e.textContent ?? '')
        .join('\n');
      // Each style id alone: the browser closes `.a` at the end of its sheet and keeps `.b`
      expect({ text, top: topLevelPreludes(text) }).toMatchObject({
        top: expect.arrayContaining(['.b']),
      });
      destroyScope('r4unclosed', { shadowRoot });
    });

    it('SB2 in a shadow root with compression skipped, an unclosed comment in one style id does not swallow the next', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const add = styleManagerFactory('r4comment', { shadowRoot });
      add('a', '.a{color:red}/* todo', true);
      add('b', '.b{color:blue}', true);
      flush();
      const text = Array.from(shadowRoot.querySelectorAll('style'))
        .map((e) => e.textContent ?? '')
        .join('\n');
      expect({ text, top: topLevelPreludes(text) }).toMatchObject({
        top: expect.arrayContaining(['.b']),
      });
      destroyScope('r4comment', { shadowRoot });
    });

    it('SB0 control: in document mode the scoper drops the unclosed rule, so the next style id survives', () => {
      const add = styleManagerFactory('r4unclosedDoc');
      add('a', '.a { color: red; ');
      add('b', '.b { color: blue; }');
      flush();
      const text = Array.from(document.querySelectorAll('style.r4unclosedDoc'))
        .map((e) => e.textContent ?? '')
        .join('\n');
      expect(topLevelPreludes(text)).toContain('.r4unclosedDoc .b');
      destroyScope('r4unclosedDoc');
    });
  });
});
