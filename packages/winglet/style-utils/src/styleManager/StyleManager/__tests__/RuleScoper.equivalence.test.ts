import { describe, expect, test } from 'vitest';

import { compressCss } from '../../../utils/compressCss/compressCss';
import { RuleScoper } from '../utils/RuleScoper';
import { ReferenceRuleScoper } from './fixtures/ReferenceRuleScoper';
import { createRandom } from './fixtures/createRandom';
import { generateSheet } from './fixtures/generateSheet';

/** Inputs of the scoping tests in `RuleScoper.test.ts` and `StyleManager.test.ts`. */
const TEST_INPUTS = [
  '@media (x) { @supports (y) { .a { c: d } } } @-moz-document url-prefix() { .b{} } .c { e: f }',
  '@keyframes fade { from { opacity: 0 } to { opacity: 1 } } .a{}',
  '@import url(a.css); @layer x, y; .a{}',
  '.a { color: red; &:hover { color: blue } } .b{}',
  '.a, .b:is(.c, .d), [title="x,y"], .e\\,f, :root, :host { x: y }',
  '.a { color: rgb(1, 2, 3) } .b, .c { x: y } .d {}',
  '.a { content: "{"; color: red } .b { color: blue }',
  '.a { color: red; /* { */ } .b { color: blue }',
  '.a { content: "}"; color: red } .b { color: blue }',
  '@import "data:text/css;base64,AA"; .a{}',
  '@import url("https://example.com/a;b.css"); .a{}',
  '@import url(http://x.com/a;b.css); .a{}',
  '@supports (content: ";") { .a { color: red } }',
  '@media screen /* ; */ and (min-width: 1px) { .a{} } .b{}',
  '.a { color: red } } .b { color: blue }',
  '@scope (.a) { .b { color: red } } .c {}',
  '/* note */ @media (x) { .a { color: red } } .b {}',
  '@import url(a.css);',
  '@import url(a.css); @layer x',
  '.a\\{ { x: y } .b {}',
  '.a { background: url(http://x.com/a/*b) } .b {}',
  '.a { background: URL(http://x.com/a/*b) } .b {}',
  '.a { b: myurl(x /* ) } */) } .b {}',
  '.a{} @media (x) { .b{}',
  '\n        .btn { color: blue; }\n        .btn:hover { color: red; }\n      ',
  '\n        .btn { color: blue; }\n        @media (max-width: 768px) {\n          .btn { color: red; }\n        }\n      ',
  '.a, .b { color: red; }',
  '@media (max-width: 1px) { .a { color: red; } } .b { color: blue; }',
  '.test { color: red; }',
];

/** Fragments at the edges of the flat-rule fast path, glued between generated sheets. */
const EDGE_FRAGMENTS = [
  '.w {a:b}',
  '.w\n{a:b}',
  ':root{a:b}',
  ':host{a:b}',
  ':hover{a:b}',
  ':root {a:b}',
  '.l,.m{a:b}',
  '.l , .m {a:b}',
  '.i:is(.p,.q){a:b}',
  '.f{a:b}"q"',
  ".f{a:b}'q'",
  '.f{a:b}/* } */',
  '.f{a:b}\\}',
  '@media (x){.f{a:b}}',
  '@media (x){.f{a:b}.g{c:d}}',
  '}',
  '.x}.y{a:b}',
  '@media (x){.a}.b{c:d}}',
  '.e{}',
  '.e {}',
  '{a:b}',
  ';{a:b}',
  '/* c */{a:b}',
  '@import x;{a:b}',
  '@import url(http://x.com/a;b.css);',
  '.n{b:noturl(x/* ) } */)}',
  '.u{b:URL(x/*y)}',
  '.u{b:url(x;y)}',
  '.k{a:"}"}',
  '.k{a:b;c:d}',
  '. x{a:b}',
  ' .x{a:b}',
  '.x {a:b}',
  '~.x{a:b}',
  '.x~{a:b}',
];

const SCOPE = '.s';
const compare = (css: string) => ({
  css,
  fast: new RuleScoper(css, SCOPE).scopeSheet(),
  general: new ReferenceRuleScoper(css, SCOPE).scopeSheet(),
});

/** Glues generated sheets and edge fragments, with or without whitespace between them. */
const generateEdgeSheet = (random: () => number): string => {
  let css = '';
  const count = 2 + Math.floor(random() * 6);
  for (let index = 0; index < count; index++) {
    css +=
      random() < 0.5
        ? generateSheet(random, 0)
        : EDGE_FRAGMENTS[Math.floor(random() * EDGE_FRAGMENTS.length)];
    if (random() < 0.5) css += ' ';
  }
  return css;
};

describe('RuleScoper flat-rule fast path', () => {
  test('matches the general path on every test input and edge fragment, raw and compressed', () => {
    for (const css of [...TEST_INPUTS, ...EDGE_FRAGMENTS])
      for (const input of [css, compressCss(css)]) {
        const { fast, general } = compare(input);
        expect({ input, fast }).toEqual({ input, fast: general });
      }
  });

  test('matches the general path on 1200 generated sheets, raw and compressed', () => {
    for (let seed = 1; seed <= 1200; seed++) {
      const css = generateEdgeSheet(createRandom(seed));
      for (const input of [css, compressCss(css)]) {
        const { fast, general } = compare(input);
        expect({ seed, input, fast }).toEqual({ seed, input, fast: general });
      }
    }
  });
});
