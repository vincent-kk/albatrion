import { scanDocument } from './scanDocument/scanDocument.js';
import type { LocatedBlock } from './scanDocument/types.js';

/** Assert safe block embedding while reusing the lexical discovery pass.
 * @param content Markdown document or rule source, including reversible bytes.
 * @param file Name displayed with the opening line in an actionable diagnostic.
 * @returns Located blocks when the supported Markdown boundaries are closed.
 * @throws When a fence or comment prevents unambiguous block insertion.
 */
export function assertManagedMarkdown(
  content: string,
  file: string,
): LocatedBlock[] {
  const result = scanDocument(content);
  if (result.issue)
    throw new Error(`${file}:${result.issue.line}: ${result.issue.message}`);
  return result.blocks;
}
