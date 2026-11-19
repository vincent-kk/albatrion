/**
 * Hunter r5-style-react-modal: whitespace around `+` outside parentheses.
 * Token streams come from the CSS Syntax Level 3 tokenizer `@csstools/css-tokenizer`.
 * Public API: `compressCss` and `styleManagerFactory` from the package source entry.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../../index';
import { captureFrames, significantTokens } from './cssSyntax';

afterEach(() => vi.unstubAllGlobals());

describe('compressCss: a sign token separated from a number only by whitespace', () => {
  it('C1 keeps the tokens of a partial calc expression stored in a custom property', () => {
    const css = '.a { --gap: 8px + 4px; width: calc(var(--gap)); }';
    const out = compressCss(css);
    expect({ out, tokens: significantTokens(out) }).toEqual({
      out: expect.any(String),
      tokens: significantTokens(css),
    });
  });

  it('C2 same in the no-opaque fast path (no parentheses, quotes or comments in the sheet)', () => {
    const css = '.a { --total: 1 + .5; }';
    const out = compressCss(css);
    expect({ out, tokens: significantTokens(out) }).toEqual({
      out: expect.any(String),
      tokens: significantTokens(css),
    });
  });

  it('C3 whitespace and a comment are equivalent token separators', () => {
    expect(significantTokens(compressCss('.a{--gap:8px + 4px}'))).toEqual(
      significantTokens(compressCss('.a{--gap:8px +/**/4px}')),
    );
  });

  it('C4 styleManagerFactory with default compression keeps the custom property tokens', () => {
    const frames = captureFrames();
    vi.stubGlobal('requestAnimationFrame', frames.request);
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const add = styleManagerFactory('r5signs');
    add('gap', '.a { --gap: 8px + 4px; width: calc(var(--gap)); }');
    frames.flush();
    const text = document.head.querySelector('style.r5signs')?.textContent ?? '';
    destroyScope('r5signs');
    expect(text).toContain('8px + 4px');
  });

  it('C0 control: the space-free combinator and the signed number keep their tokens', () => {
    for (const css of ['.a + .b{x:y}', '.a{margin:1px +2px}', '.a{width:calc(1px + 2px)}']) {
      expect(significantTokens(compressCss(css))).toEqual(significantTokens(css));
    }
  });
});
