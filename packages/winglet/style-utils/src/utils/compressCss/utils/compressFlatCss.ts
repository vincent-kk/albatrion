import { hasCssCdcBoundary } from '../../cssTokens/hasCssCdcBoundary';

/** Bytes needing work after the caller excludes all opaque constructs and opening parentheses. */
const CONTROL = new Uint8Array(128);
for (const byte of [9, 10, 12, 13, 32, 59]) CONTROL[byte] = 1;

/**
 * Compress the ordinary no-opaque-token fast path without constructing a lexical model.
 * @param css Stylesheet already checked for strings, comments, escapes and opening parentheses.
 * @returns The compressed stylesheet with selector whitespace preserved.
 */
export function compressFlatCss(css: string): string {
  const buffer = new TextEncoder().encode(css);
  const output = new Uint8Array(buffer.length);
  let cursor = 0, size = 0, previous = 0;
  while (cursor < buffer.length) {
    const code = buffer[cursor];
    if (!CONTROL[code]) { output[size++] = previous = code; cursor++; continue; }
    if (code === 59) {
      let next = cursor + 1;
      while (buffer[next] === 59) next++;
      let head = next;
      while (buffer[head] === 32 || buffer[head] === 9 || buffer[head] === 10 || buffer[head] === 12 || buffer[head] === 13) head++;
      if (buffer[head] !== 125) output[size++] = previous = 59;
      cursor = next;
      continue;
    }
    const previousEnd = cursor;
    while (++cursor < buffer.length) {
      const next = buffer[cursor];
      if (next !== 32 && next !== 9 && next !== 10 && next !== 12 && next !== 13) break;
    }
    if (size === 0 || cursor === buffer.length) continue;
    const next = buffer[cursor];
    let keep = previous !== 123 && previous !== 125 && previous !== 59 && previous !== 58 && previous !== 44 && previous !== 62 && previous !== 126 && previous !== 43 && previous !== 40 && next !== 123 && next !== 125 && next !== 59 && next !== 44 && next !== 62 && next !== 126 && next !== 43 && next !== 41;
    if (hasCssCdcBoundary(buffer, previousEnd, next)) keep = true;
    if (keep && next === 58) {
      let head = cursor + 1;
      while (head < buffer.length && buffer[head] !== 123 && buffer[head] !== 125 && buffer[head] !== 59) head++;
      keep = buffer[head] !== 125 && buffer[head] !== 59;
    }
    if (keep) output[size++] = previous = 32;
  }
  while (size && output[size - 1] === 32) size--;
  return new TextDecoder().decode(output.subarray(0, size));
}
