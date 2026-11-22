import { afterEach, describe, expect, test, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../../index';

describe('compressCss', () => {
  test('keeps the descendant combinator before a pseudo-class', () => {
    // ".a :hover" (hovered descendant of .a) differs from ".a:hover" (hovered .a)
    expect(compressCss('.a :hover{color:red}')).toBe('.a :hover{color:red}');
  });
  test('keeps the whitespace calc() requires around +', () => {
    expect(compressCss('.a{width:calc(1px + 2px)}')).toBe(
      '.a{width:calc(1px + 2px)}',
    );
  });
  test('does not treat comment markers inside a string as a comment', () => {
    expect(compressCss('.a{content:"/*"}.b{color:red}')).toBe(
      '.a{content:"/*"}.b{color:red}',
    );
  });
});

const appliedCss = (scope: string): string => {
  const element = document.querySelector(`style.${scope}`);
  return element?.textContent ?? '';
};

describe('StyleManager scoping (via styleManagerFactory)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  test('every selector in a selector list receives the scope prefix', () => {
    vi.useFakeTimers();
    const add = styleManagerFactory('bounty-list');
    add('s', '.a, .b { color: red; }');
    vi.runAllTimers();
    const css = appliedCss('bounty-list');
    destroyScope('bounty-list');
    expect(css).toContain('.bounty-list .a');
    expect(css).toContain('.bounty-list .b');
  });
  test('a nested @media block keeps its closing brace so later rules stay outside it', () => {
    vi.useFakeTimers();
    const add = styleManagerFactory('bounty-media');
    add(
      's',
      '@media (max-width: 1px) { .a { color: red; } } .b { color: blue; }',
    );
    vi.runAllTimers();
    const css = appliedCss('bounty-media');
    destroyScope('bounty-media');
    const opens = css.split('{').length - 1;
    const closes = css.split('}').length - 1;
    expect(closes).toBe(opens);
  });
});
