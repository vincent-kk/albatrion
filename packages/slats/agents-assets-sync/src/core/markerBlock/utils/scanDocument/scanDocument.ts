import { MARKER_PREFIX } from '../markerLine.js';
import type { LocatedBlock, MarkdownScan } from './types.js';
import { hasUnclosedComment } from './utils/hasUnclosedComment.js';

/** Scan supported Markdown contexts once, preserving original byte offsets.
 * @param content Document text or a reversible Latin-1 byte view.
 * @returns Blocks and the first boundary that prevents insertion.
 */
export function scanDocument(content: string): MarkdownScan {
  const blocks: LocatedBlock[] = [];
  const marker = new RegExp(`^<!-- ${MARKER_PREFIX}:(START|END):(.+?) -->$`);
  let offset = 0;
  let lineNumber = 0;
  let fence = '';
  let fenceLine = 0;
  let commentLine = 0;
  let listIndent = 0;
  let blank = false;
  let pending:
    | { blockId: string; start: number; bodyStart: number }
    | undefined;
  while (offset < content.length) {
    lineNumber++;
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
    } else if (commentLine) {
      const close = line.indexOf('-->');
      if (close >= 0)
        commentLine = hasUnclosedComment(line.slice(close + 3))
          ? lineNumber
          : 0;
    } else {
      const container =
        /^(?:(?: {0,3}>[ \t]*)|(?: {0,3}(?:[-+*]|\d+[.)])[ \t]+))+(.*)$/.exec(
          line,
        );
      const list = /^( *)(?:[-+*]|\d+[.)])([ \t]+)(.*)$/.exec(line);
      const indentedFence = /^([ \t]*)(`{3,}|~{3,})(.*)$/.exec(line);
      const nested = container && /^\s*(`{3,}|~{3,})/.test(container[1]);
      const validFence =
        indentedFence &&
        (indentedFence[2][0] !== '`' || !indentedFence[3].includes('`'));
      if (
        nested ||
        (validFence && listIndent > 0 && indentedFence[1].length >= listIndent)
      )
        return {
          blocks,
          issue: {
            line: lineNumber,
            message:
              'Fences inside blockquotes or list items are not supported. Move the fence to the top level and close it.',
          },
        };
      if (
        validFence &&
        (indentedFence[1].includes('\t') || indentedFence[1].length > 3)
      )
        return {
          blocks,
          issue: {
            line: lineNumber,
            message:
              'Indented fence syntax is not supported. Use at most three spaces and close the fence.',
          },
        };
      if (validFence) {
        fence = indentedFence[2];
        fenceLine = lineNumber;
        listIndent = 0;
      } else {
        if (list) listIndent = list[0].length - list[3].length;
        else if (
          blank &&
          line.trim() &&
          line.length - line.trimStart().length < listIndent
        )
          listIndent = 0;
        blank = !line.trim();
        const match = marker.exec(line);
        if (match || /^ {0,3}<!--/.test(line)) listIndent = 0;
        if (match?.[1] === 'START' && !pending)
          pending = { blockId: match[2], start: offset, bodyStart: next };
        else if (match?.[1] === 'END' && pending?.blockId === match[2]) {
          blocks.push({
            blockId: pending.blockId,
            body: content.slice(pending.bodyStart, offset),
            start: pending.start,
            end: next,
          });
          pending = undefined;
        } else if (!match && hasUnclosedComment(line)) commentLine = lineNumber;
      }
    }
    offset = next;
  }
  if (fence)
    return {
      blocks,
      issue: {
        line: fenceLine,
        message:
          'Unclosed fenced code block. Close the fence before adding managed blocks.',
      },
    };
  if (commentLine)
    return {
      blocks,
      issue: {
        line: commentLine,
        message:
          'Unclosed HTML comment. Close the comment with --> before adding managed blocks.',
      },
    };
  return { blocks };
}
