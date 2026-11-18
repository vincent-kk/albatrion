import { describe, expect, it } from 'vitest';

import { mayExtendCssEscape } from '../mayExtendCssEscape';

describe('extended CSS escape classification', () => {
  it('includes every ASCII hex, URL-name and CR start', () => {
    const codes = Array.from({ length: 128 }, (_, code) => code);
    const reference = codes.filter(
      (code) => code === 13 || /[0-9a-frlu]/i.test(String.fromCharCode(code)),
    );
    expect(reference.every(mayExtendCssEscape)).toBe(true);
  });
  it('treats the missing code after a final backslash as a simple escape', () => {
    expect(mayExtendCssEscape(NaN)).toBe(false);
  });
});
