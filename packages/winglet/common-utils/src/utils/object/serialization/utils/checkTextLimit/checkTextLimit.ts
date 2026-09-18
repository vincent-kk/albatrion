/** Enforces the UTF-8 wire budget without allocating an encoded byte buffer. */
export function checkTextLimit(text: string): void {
  if (typeof text !== 'string' || text.length > 16777216)
    throw new TypeError('Graph text limit exceeded');
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) bytes++;
    else if (code < 2048) bytes += 2;
    else if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      text.charCodeAt(i + 1) >= 0xdc00 &&
      text.charCodeAt(i + 1) <= 0xdfff
    ) {
      bytes += 4;
      i++;
    } else bytes += 3;
    if (bytes > 16777216) throw new TypeError('Graph text limit exceeded');
  }
}
