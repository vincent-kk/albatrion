import { type Sha256Hex, hashContent, hashEquals } from '../hash/index.js';
import {
  createBlockPattern,
  endMarker,
  startMarker,
} from './utils/markerLine.js';

/** One block this tool owns inside a shared `AGENTS.md`. */
export interface ParsedBlock {
  readonly blockId: string;
  readonly packageName: string;
  readonly relPath: string;
  /** Bytes between the marker lines, excluding the markers' own newlines. */
  readonly body: string;
}

/**
 * Build the identifier that ties a block to the file it came from.
 *
 * @param packageName - consumer package that owns the rule
 * @param relPath - manifest-relative path of the rule file
 * @returns `<packageName>:<relPath>`
 */
export function formatBlockId(packageName: string, relPath: string): string {
  return `${packageName}:${relPath}`;
}

/**
 * Read every block this tool wrote, in document order.
 *
 * Blocks owned by other tools and free-standing prose are ignored, so the
 * result describes only what this tool may rewrite.
 *
 * @param content - full `AGENTS.md` content
 * @returns parsed blocks; empty when the document holds none
 */
export function parseBlocks(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const pattern = createBlockPattern();
  let match = pattern.exec(content);
  while (match !== null) {
    const blockId = match[1] as string;
    const separator = blockId.indexOf(':');
    blocks.push({
      blockId,
      packageName: separator === -1 ? blockId : blockId.slice(0, separator),
      relPath: separator === -1 ? '' : blockId.slice(separator + 1),
      body: match[2] as string,
    });
    match = pattern.exec(content);
  }
  return blocks;
}

/**
 * Read one block's body.
 *
 * @param content - full `AGENTS.md` content
 * @param blockId - identifier from `formatBlockId`
 * @returns the body, or `null` when the document holds no such block
 */
export function findBlockBody(content: string, blockId: string): string | null {
  return locateBlock(content, blockId)?.body ?? null;
}

/**
 * Write `body` into `blockId`'s block, replacing it in place when present and
 * appending at the end when absent.
 *
 * Everything outside the block — free prose and other tools' blocks — is
 * carried through byte for byte. One newline is appended when `content` does
 * not end with one, so the opening marker starts its own line.
 *
 * @param content - full `AGENTS.md` content, possibly empty
 * @param blockId - identifier from `formatBlockId`
 * @param body - source file bytes to place between the markers
 * @returns the updated document
 */
export function upsertBlock(
  content: string,
  blockId: string,
  body: string,
): string {
  const rendered = `${startMarker(blockId)}\n${body}${
    body.endsWith('\n') ? '' : '\n'
  }${endMarker(blockId)}\n`;
  const found = locateBlock(content, blockId);
  if (found)
    return content.slice(0, found.start) + rendered + content.slice(found.end);
  const base =
    content.length > 0 && !content.endsWith('\n') ? `${content}\n` : content;
  return base + rendered;
}

/**
 * Drop `blockId`'s block and its marker lines.
 *
 * @param content - full `AGENTS.md` content
 * @param blockId - identifier from `formatBlockId`
 * @returns the document without that block, unchanged when it held none
 */
export function removeBlock(content: string, blockId: string): string {
  const found = locateBlock(content, blockId);
  if (!found) return content;
  return content.slice(0, found.start) + content.slice(found.end);
}

/**
 * Decide whether a block's body still carries the manifest's content.
 *
 * `upsertBlock` appends a newline when the source file lacks one, so a body
 * read back may hold one byte the source did not. Both readings are checked,
 * which keeps the verdict identical to the file-copy path's hash comparison.
 *
 * @param body - body returned by `parseBlocks` or `findBlockBody`
 * @param expected - the manifest's SHA-256 for the source file
 * @returns `true` when the body matches the manifest
 */
export function blockBodyMatches(body: string, expected: Sha256Hex): boolean {
  if (hashEquals(hashContent(body), expected)) return true;
  return (
    body.endsWith('\n') && hashEquals(hashContent(body.slice(0, -1)), expected)
  );
}

// Scan for one block by exact identifier. Matching on the captured id rather
// than a per-id regex keeps package names with regex metacharacters literal.
function locateBlock(
  content: string,
  blockId: string,
): { start: number; end: number; body: string } | null {
  const pattern = createBlockPattern();
  let match = pattern.exec(content);
  while (match !== null) {
    if (match[1] === blockId)
      return {
        start: match.index,
        end: match.index + match[0].length,
        body: match[2] as string,
      };
    match = pattern.exec(content);
  }
  return null;
}
