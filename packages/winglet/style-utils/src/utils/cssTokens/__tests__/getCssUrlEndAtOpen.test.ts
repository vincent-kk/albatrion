import { describe, expect, test } from 'vitest';

import { getCssUrlEndAtOpen } from '../getCssUrlEndAtOpen';

const encoder = new TextEncoder();

describe('getCssUrlEndAtOpen', () => {
  test.each(['url(x)', ' url(x)', ':url(x)', ',URL(x)', '(url(x)'])(
    'reads url( at the start or after a non-identifier character: %s',
    (text) => {
      for (const source of [text, encoder.encode(text)])
        expect(getCssUrlEndAtOpen(source, source.length - 3)).toBe(source.length);
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
      for (const source of [text, encoder.encode(text)]) {
        const open = source.length - 3;
        expect(getCssUrlEndAtOpen(source, open)).toBe(open);
      }
    },
  );
});
