import { describe, expect, test } from 'vitest';

import { findUnquotedUrlEnd } from '../utils/findUnquotedUrlEnd';

describe('findUnquotedUrlEnd', () => {
  test.each(['url(x)', ' url(x)', ':url(x)', ',URL(x)', '(url(x)'])(
    'reads url( at the start or after a non-identifier character: %s',
    (text) => {
      expect(findUnquotedUrlEnd(text, text.length - 3)).toBe(text.length);
    },
  );

  test.each([
    'aurl(x)',
    'Zurl(x)',
    '7url(x)',
    '-url(x)',
    '_url(x)',
    '\\url(x)',
    'éurl(x)',
  ])(
    'treats url( after an identifier character as another function: %s',
    (text) => {
      const open = text.length - 3;
      expect(findUnquotedUrlEnd(text, open)).toBe(open);
    },
  );
});
