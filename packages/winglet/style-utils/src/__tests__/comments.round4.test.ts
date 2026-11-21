import { describe, expect, it } from 'vitest';
import { compressCss } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

const tokens = ["\"(){};/*x*/\"", "'a\\\\'b'", "url(http://x/a/*b;c)", "\\\\31  x", "\\\\75 rl(http://x/a/*b;c)", "\"bad\n", "var(--x, \")\")", "[one two]"];

describe('round-4 comments lexical positions', () => {
  for (const token of tokens)
    for (const position of ['before', 'inside', 'after'])
      it(`${token} ${position}`, () => {
        const body = position === 'before' ? token + ' a/**/b' : position === 'after' ? 'a/**/b ' + token : 'a ' + token + ' /**/b';
        const css = '.a{--x:' + body + '}';
        expect(normalizeCss(compressCss(css))).toEqual(normalizeCss(css));
      });
});

it.each([
  '.h\\31/**/x{x:y}', '.h\\31/**/é{x:y}', '.md\\:/**/flex{x:y}',
  '.a{x:a/**/(b)}', '.a{x:10/**/%}', '.a{x:+/**/1}', '.a{x:-/**/1}', '.a{x:#/**/name}',
])('round-4 comment boundary: %s', css => {
  expect(normalizeCss(compressCss(css))).toEqual(normalizeCss(css));
});
