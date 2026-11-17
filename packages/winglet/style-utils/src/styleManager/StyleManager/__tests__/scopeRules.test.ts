import { describe, expect, test } from 'vitest';

import { scopeRules } from '../utils/scopeRules';

const scope = (css: string) => scopeRules(css, 0, css.length, '.s');

describe('scopeRules', () => {
  test('scopes rules nested in grouping at-rules and keeps later rules outside', () => {
    expect(
      scope(
        '@media (x) { @supports (y) { .a { c: d } } } @-moz-document url-prefix() { .b{} } .c { e: f }',
      ),
    ).toBe(
      '@media (x){@supports (y){.s .a{ c: d }}}@-moz-document url-prefix(){.s .b{}}.s .c{ e: f }',
    );
  });

  test('copies non-grouping block at-rules unchanged', () => {
    expect(
      scope('@keyframes fade { from { opacity: 0 } to { opacity: 1 } } .a{}'),
    ).toBe('@keyframes fade{ from { opacity: 0 } to { opacity: 1 } }.s .a{}');
  });

  test('copies statement at-rules unchanged', () => {
    expect(scope('@import url(a.css); @layer x, y; .a{}')).toBe(
      '@import url(a.css);@layer x, y;.s .a{}',
    );
  });

  test('keeps a nested rule inside its style rule block', () => {
    expect(scope('.a { color: red; &:hover { color: blue } } .b{}')).toBe(
      '.s .a{ color: red; &:hover { color: blue } }.s .b{}',
    );
  });

  test('prefixes each selector split at top-level commas only', () => {
    expect(
      scope('.a, .b:is(.c, .d), [title="x,y"], .e\\,f, :root, :host { x: y }'),
    ).toBe(
      '.s .a,.s .b:is(.c, .d),.s [title="x,y"],.s .e\\,f,:root,:host{ x: y }',
    );
  });

  test('drops a trailing rule without a matching brace', () => {
    expect(scope('.a{} @media (x) { .b{}')).toBe('.s .a{}');
  });
});
