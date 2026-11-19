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
