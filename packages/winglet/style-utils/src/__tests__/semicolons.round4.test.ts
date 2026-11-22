import { describe, expect, it } from 'vitest';
import { compressCss } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

const tokens = ["\"(){};/*x*/\"", "'a\\\\'b'", "url(http://x/a/*b;c)", "\\\\31  x", "\\\\75 rl(http://x/a/*b;c)", "\"bad\n", "var(--x, \")\")", "[one two]"];

describe('round-4 semicolons lexical positions', () => {
  for (const token of tokens)
    for (const position of ['before', 'inside', 'after'])
      it(`${token} ${position}`, () => {
        const body = position === 'before' ? token + '; a:b;;' : position === 'after' ? 'a:b;;' + token + ';' : 'a:' + token + ';;';
        const css = '.a{--x:' + body + '}';
        expect(normalizeCss(compressCss(css))).toEqual(normalizeCss(css));
      });
});
