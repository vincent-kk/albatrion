import { assertManagedMarkdown } from './assertManagedMarkdown.js';

/** Validate a normalized rule as text embedded inside one managed block.
 * @param body Normalized source bytes in a reversible Latin-1 view.
 * @param file Original source path used in refusal diagnostics.
 * @throws With the file and line when a context is unsafe or markers would nest.
 */
export function assertRuleSource(body: string, file: string): void {
  const blocks = assertManagedMarkdown(body, file, true);
  if (blocks.length) {
    const line = body.slice(0, blocks[0].start).split('\n').length;
    throw new Error(
      `${file}:${line}: Managed markers in an embedded rule would nest. Put examples inside a closed fence or comment.`,
    );
  }
}
