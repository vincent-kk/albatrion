import { describe, expect, it } from 'vitest';

import { getCssEscapeEnd } from '../../../utils/cssTokens/getCssEscapeEnd';
import { getEscapedUrlEnd } from '../../../utils/cssTokens/getEscapedUrlEnd';
import { skipOpaqueToken } from '../utils/skipOpaqueToken';

describe('round-3 style-utils 1: escape fast-path equivalence', () => {
  it('matches the unconditional full token reader over every ASCII start', () => {
    const tails = ['', '0 f', 'abcde f', '\r\n.x', 'rl(a)', 'rl(a/*b)', 'x(a)'];
    for (let code = 0; code < 128; code++) {
      for (const tail of tails) {
        const css = `a\\${String.fromCharCode(code)}${tail}`;
        const urlEnd = getEscapedUrlEnd(css, 1);
        const completeEnd = urlEnd === 1 ? getCssEscapeEnd(css, 1) : urlEnd;
        expect(skipOpaqueToken(css, 1), JSON.stringify(css)).toBe(completeEnd);
      }
    }
  });
});
