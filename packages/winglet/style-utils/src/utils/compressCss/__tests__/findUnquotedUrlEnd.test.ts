import { describe, expect, test } from 'vitest';

import { findUnquotedUrlEnd } from '../utils/findUnquotedUrlEnd';

const bytes = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('findUnquotedUrlEnd', () => {
  test.each(['url(x)', ' url(x)', ':url(x)', ',URL(x)', '(url(x)'])(
    'reads url( at the start or after a non-identifier byte: %s',
    (text) => {
      const buffer = bytes(text);
      expect(findUnquotedUrlEnd(buffer, buffer.length - 3)).toBe(buffer.length);
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
  ])('treats url( after an identifier byte as another function: %s', (text) => {
    const buffer = bytes(text);
    const open = buffer.length - 3;
    expect(findUnquotedUrlEnd(buffer, open)).toBe(open);
  });
});
