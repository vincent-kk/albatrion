import { describe, expect, it } from 'vitest';

import { compressCss } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

describe('escaped punctuation keeps selector whitespace', () => {
  for (const punctuation of ['{', '}', ';', ':', '>', '+', '~', '(']) {
    for (const whitespace of [' ', '\n', '\t']) {
      it(`${punctuation} followed by ${JSON.stringify(whitespace)}`, () => {
        const css = `.a\\${punctuation}${whitespace}.b { color: red }`;
        expect(normalizeCss(compressCss(css))).toEqual(normalizeCss(css));
        expect(compressCss(css)).toBe(`.a\\${punctuation} .b{color:red}`);
      });
    }
  }
});
