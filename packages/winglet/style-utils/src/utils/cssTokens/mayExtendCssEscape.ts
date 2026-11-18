/** Upper- and lowercase hex letters and URL-name letters share these positions. */
const LETTER_MASK = 0x0024107e;

/**
 * Classifies starts that need complete hex, URL-name, or CRLF token recognition.
 * @param code - The next UTF-8 byte or UTF-16 code unit, or NaN at end of input
 * @returns Exact eligibility for ASCII; non-ASCII false positives use the full token reader
 */
export const mayExtendCssEscape = (code: number): boolean => {
  if (code >= 64) return (LETTER_MASK & (1 << code)) !== 0;
  return code === 13 || (code >= 48 && code <= 57);
};
