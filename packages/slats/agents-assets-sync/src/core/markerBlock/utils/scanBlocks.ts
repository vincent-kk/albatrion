import { createBlockPattern } from './markerLine.js';

/** Lexically located managed block, excluding Markdown examples. */
export interface LocatedBlock {
  readonly blockId: string;
  readonly body: string;
  readonly start: number;
  readonly end: number;
}

/** Scan top-level marker blocks while treating fenced code as literal prose.
 * @param content Full string or reversible byte view of a document.
 * @returns Located blocks in source order, including duplicate identifiers.
 */
export function scanBlocks(content: string): LocatedBlock[] {
  const result: LocatedBlock[] = [];
  const pattern = createBlockPattern(content);
  let offset = 0;
  let fence = '';
  while (offset < content.length) {
    const end = content.indexOf('\n', offset);
    const next = end === -1 ? content.length : end + 1;
    const line = content.slice(offset, end === -1 ? content.length : end).replace(/\r$/, '');
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (delimiter && delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = '';
    } else if (delimiter && (delimiter[1][0] !== '`' || !delimiter[2].includes('`'))) fence = delimiter[1];
    else {
      pattern.lastIndex = offset;
      const match = pattern.exec(content);
      if (match && match.index === offset) {
        result.push({ blockId: match[1], body: match[2], start: offset, end: offset + match[0].length });
        offset += match[0].length;
        continue;
      }
    }
    offset = next;
  }
  return result;
}
