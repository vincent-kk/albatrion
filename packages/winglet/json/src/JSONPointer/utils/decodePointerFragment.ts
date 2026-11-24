/**
 * Decode the URI escapes of a fragment while retaining its leading marker.
 *
 * Escapes of single-byte characters (`%00` to `%7F`) are decoded here; a fragment holding
 * any other escape, or a malformed one, is decoded whole by `decodeURIComponent`, so the
 * result and the failure cases are exactly those of `decodeURIComponent`.
 * @param fragment A pointer beginning with `#`.
 * @returns The pointer with its original marker and percent escapes decoded once.
 * @throws URIError for an invalid percent escape or invalid encoded text.
 */
export function decodePointerFragment(fragment: string): string {
  let percent = fragment.indexOf('%');
  if (percent < 0) return fragment;
  let decoded = '';
  let start = 0;
  do {
    const code = readAsciiEscape(fragment, percent);
    if (code < 0) return decodeURIComponent(fragment);
    decoded += fragment.slice(start, percent) + String.fromCharCode(code);
    start = percent + 3;
    percent = fragment.indexOf('%', start);
  } while (percent >= 0);
  return decoded + fragment.slice(start);
}

/**
 * Read the escape at `percent` when it encodes a single-byte character.
 * @param text The fragment being decoded.
 * @param percent Position of a `%` in `text`.
 * @returns The character code `0` to `127`, or -1 for any other or malformed escape.
 */
const readAsciiEscape = (text: string, percent: number): number => {
  const high = hexDigit(text.charCodeAt(percent + 1));
  const low = hexDigit(text.charCodeAt(percent + 2));
  return high < 0 || high > 7 || low < 0 ? -1 : high * 16 + low;
};

/**
 * Value of one hexadecimal digit.
 * @param code A character code; `NaN` past the end of the text.
 * @returns The digit value `0` to `15`, or -1 when `code` is not a hexadecimal digit.
 */
const hexDigit = (code: number): number => {
  if (code >= 48 && code <= 57) return code - 48;
  const lower = code | 32;
  return lower >= 97 && lower <= 102 ? lower - 87 : -1;
};
