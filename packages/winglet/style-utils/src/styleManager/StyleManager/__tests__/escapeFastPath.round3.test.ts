import { describe, expect, it } from 'vitest';

import { getCssEscapeEnd } from '../../../utils/cssTokens/getCssEscapeEnd';
import { getEscapedUrlEnd } from '../../../utils/cssTokens/getEscapedUrlEnd';
import { getCssOpaqueEnd } from '../../../utils/cssTokens/getCssOpaqueEnd';

describe('round-3 style-utils 1: escape fast-path equivalence', () => {
  it('matches the unconditional full token reader over every ASCII start', () => {
    const tails = ['', '0 f', 'abcde f', '\r\n.x', 'rl(a)', 'rl(a/*b)', 'x(a)'];
    for (const prefix of ['', 'a', ' ']) {
      for (let code = 0; code < 128; code++) {
        for (const tail of tails) {
          const css = `${prefix}\\${String.fromCharCode(code)}${tail}`;
          const index = prefix.length;
          const urlEnd = getEscapedUrlEnd(css, index);
          const completeEnd =
            urlEnd === index ? getCssEscapeEnd(css, index) : urlEnd;
          expect(getCssOpaqueEnd(css, index), JSON.stringify(css)).toBe(
            completeEnd,
          );
        }
      }
    }
  });
});
