/** Low-five-bit positions of ASCII digits. */
const DIGIT_MASK = 0x03ff0000;

/** Upper- and lowercase hex letters and URL-name letters share these positions. */
const LETTER_MASK = 0x0024107e;

/**
 * Classifies starts that need complete hex, URL-name, or CRLF token recognition.
 * @param code - The next UTF-8 byte or UTF-16 code unit, or NaN at end of input
 * @returns Exact eligibility for printable ASCII and CR; conservative control/non-ASCII matches use the full token reader
 */
export const mayExtendCssEscape = (code: number): boolean => {
  const mask = code < 64 ? DIGIT_MASK : LETTER_MASK;
  return (mask & (1 << code)) !== 0 || code === 13;
};
