/**
 * Comment-marker namespace for every block this tool owns inside a shared
 * `AGENTS.md`. It mirrors the `FILID:START:` / `SEIRI:START:` convention the
 * same file already carries, so several tools can append without colliding.
 */
export const MARKER_PREFIX = 'AGENTS-ASSETS-SYNC';

/**
 * Build the opening marker line for a block.
 *
 * @param blockId - `<packageName>:<relPath>` identifier
 * @returns the marker line, without a trailing newline
 */
export function startMarker(blockId: string): string {
  return `<!-- ${MARKER_PREFIX}:START:${blockId} -->`;
}

/**
 * Build the closing marker line for a block.
 *
 * @param blockId - `<packageName>:<relPath>` identifier
 * @returns the marker line, without a trailing newline
 */
export function endMarker(blockId: string): string {
  return `<!-- ${MARKER_PREFIX}:END:${blockId} -->`;
}

const LF_BLOCK_SOURCE = `<!-- ${MARKER_PREFIX}:START:(.+?) -->\\n([\\s\\S]*?)<!-- ${MARKER_PREFIX}:END:\\1 -->\\n?`;
const CRLF_BLOCK_SOURCE = `<!-- ${MARKER_PREFIX}:START:(.+?) -->\\r?\\n([\\s\\S]*?)<!-- ${MARKER_PREFIX}:END:\\1 -->(?:\\r?\\n)?`;

/**
 * Build a fresh global pattern matching every block this tool wrote in
 * `content`.
 *
 * A new instance is returned on each call because a global regex carries
 * `lastIndex` between uses, and a shared one would skip matches. A document
 * holding a carriage return gets the pattern that also accepts `\r\n` after
 * each marker: a `core.autocrlf` checkout rewrites every line ending, and an
 * unrecognized block would be appended again. Every other document gets the
 * LF-only pattern, so an LF document pays for nothing but the one scan.
 *
 * @param content - the document the pattern will run over
 * @returns pattern with capture groups `1` = blockId, `2` = body
 */
export function createBlockPattern(content: string): RegExp {
  return new RegExp(
    content.indexOf('\r') === -1 ? LF_BLOCK_SOURCE : CRLF_BLOCK_SOURCE,
    'g',
  );
}
