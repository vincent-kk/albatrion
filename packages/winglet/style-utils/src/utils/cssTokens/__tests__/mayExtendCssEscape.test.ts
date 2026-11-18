import { describe, expect, it } from 'vitest';

import { mayExtendCssEscape } from '../mayExtendCssEscape';

describe('extended CSS escape classification', () => {
  it('matches the ASCII hex, URL-name and CR classifier', () => {
    const codes = Array.from({ length: 128 }, (_, code) => code);
    const reference = codes.filter(
      (code) => code === 13 || /[0-9a-frlu]/i.test(String.fromCharCode(code)),
    );
    expect(codes.filter(mayExtendCssEscape)).toEqual(reference);
  });
  it('treats the missing code after a final backslash as a simple escape', () => {
    expect(mayExtendCssEscape(NaN)).toBe(false);
  });
});
