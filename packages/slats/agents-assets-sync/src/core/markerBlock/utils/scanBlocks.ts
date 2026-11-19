import { MARKER_PREFIX } from './markerLine.js';

/** Lexically located managed block, excluding Markdown examples. */
export interface LocatedBlock {
  readonly blockId: string;
  readonly body: string;
  readonly start: number;
  readonly end: number;
}

/** Scan markers only outside CommonMark fences, including within rule bodies.
 * @param content Complete document text or a reversible byte view.
 * @returns Managed blocks in document order, including duplicate identifiers.
 */
export function scanBlocks(content: string): LocatedBlock[] {
  const result: LocatedBlock[] = [];
  const marker = new RegExp(`^<!-- ${MARKER_PREFIX}:(START|END):(.+?) -->$`);
  let offset = 0;
  let fence = '';
  let pending:
    | { blockId: string; start: number; bodyStart: number }
    | undefined;
  while (offset < content.length) {
    const end = content.indexOf('\n', offset);
    const next = end === -1 ? content.length : end + 1;
    const line = content
      .slice(offset, end === -1 ? content.length : end)
      .replace(/\r$/, '');
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (
        delimiter &&
        delimiter[1][0] === fence[0] &&
        delimiter[1].length >= fence.length &&
        !delimiter[2].trim()
      )
        fence = '';
    } else if (
      delimiter &&
      (delimiter[1][0] !== '`' || !delimiter[2].includes('`'))
    )
      fence = delimiter[1];
    else {
      const match = marker.exec(line);
      if (match?.[1] === 'START' && !pending)
        pending = { blockId: match[2], start: offset, bodyStart: next };
      else if (match?.[1] === 'END' && pending?.blockId === match[2]) {
        result.push({
          blockId: pending.blockId,
          body: content.slice(pending.bodyStart, offset),
          start: pending.start,
          end: next,
        });
        pending = undefined;
      }
    }
    offset = next;
  }
  return result;
}
