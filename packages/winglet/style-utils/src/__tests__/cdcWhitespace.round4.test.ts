import { expect, it } from 'vitest';
import { compressCss } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

for (const whitespace of [' ', '\n', '\t']) for (const body of ['x:y', 'content:"x"', 'x:[one]']) {
  it(`keeps CDC tokens separate with ${JSON.stringify(whitespace)} and ${body}`, () => {
    const css = `--${whitespace}> .a {${body}}`;
    expect(normalizeCss(compressCss(css))).toEqual(normalizeCss(css));
  });
}
