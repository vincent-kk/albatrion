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

  test('finds a selector list after commas inside earlier declarations', () => {
    expect(scope('.a { color: rgb(1, 2, 3) } .b, .c { x: y } .d {}')).toBe(
      '.s .a{ color: rgb(1, 2, 3) }.s .b,.s .c{ x: y }.s .d{}',
    );
  });

  test.each([
    [
      '.a { content: "{"; color: red } .b { color: blue }',
      '.s .a{ content: "{"; color: red }.s .b{ color: blue }',
    ],
    [
      ".foo[data-x='a,b{'] { color: red } .bar { color: blue }",
      ".s .foo[data-x='a,b{']{ color: red }.s .bar{ color: blue }",
    ],
    [
      '.a { color: red; /* { */ } .b { color: blue }',
      '.s .a{ color: red; /* { */ }.s .b{ color: blue }',
    ],
    [
      '.a { content: "}"; color: red } .b { color: blue }',
      '.s .a{ content: "}"; color: red }.s .b{ color: blue }',
    ],
  ])('ignores braces inside strings and comments: %s', (input, output) => {
    expect(scope(input)).toBe(output);
  });

  test.each([
    [
      '@import "data:text/css;base64,AA"; .a{}',
      '@import "data:text/css;base64,AA";.s .a{}',
    ],
    [
      '@import url("https://example.com/a;b.css"); .a{}',
      '@import url("https://example.com/a;b.css");.s .a{}',
    ],
    [
      '@supports (content: ";") { .a { color: red } }',
      '@supports (content: ";"){.s .a{ color: red }}',
    ],
    [
      '@media screen /* ; */ and (min-width: 1px) { .a{} } .b{}',
      '@media screen /* ; */ and (min-width: 1px){.s .a{}}.s .b{}',
    ],
  ])('ends a statement only at a real semicolon: %s', (input, output) => {
    expect(scope(input)).toBe(output);
  });

  test('drops a stray closing brace instead of prefixing it onto the next rule', () => {
    expect(scope('.a { color: red } } .b { color: blue }')).toBe(
      '.s .a{ color: red }.s .b{ color: blue }',
    );
  });

  test('scopes the rules inside @scope', () => {
    expect(scope('@scope (.a) { .b { color: red } } .c {}')).toBe(
      '@scope (.a){.s .b{ color: red }}.s .c{}',
    );
  });

  test('recognizes an at-rule after a leading comment', () => {
    expect(scope('/* note */ @media (x) { .a { color: red } } .b {}')).toBe(
      '@media (x){.s .a{ color: red }}.s .b{}',
    );
  });

  test('drops a trailing rule without a matching brace', () => {
    expect(scope('.a{} @media (x) { .b{}')).toBe('.s .a{}');
  });
});
