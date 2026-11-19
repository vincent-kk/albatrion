import { assertManagedMarkdown } from './assertManagedMarkdown.js';
import { endMarker, startMarker } from './markerLine.js';

/** Write the already normalized source snapshot shared by planning and validation.
 * @param content Complete destination document.
 * @param blockId Managed identity to replace or append.
 * @param body Source body with BOM and line endings already normalized.
 * @param context File names used in refusal diagnostics.
 * @returns Complete replacement preserving bytes outside managed blocks.
 * @throws When any source or destination boundary is ambiguous.
 */
export function writeNormalizedBlock(content: string, blockId: string, body: string, context: { document?: string; source?: string } = {}): string {
  const blocks = assertManagedMarkdown(content, context.document ?? 'document');
  assertManagedMarkdown(body, context.source ?? 'rule source');
  const rendered = `${startMarker(blockId)}\n${body}${
    body.endsWith('\n') ? '' : '\n'
  }${endMarker(blockId)}\n`;
  const found = blocks.filter((block) => block.blockId === blockId);
  if (found.length) {
    let next = content;
    for (let index = found.length - 1; index >= 0; index--) {
      const block = found[index];
      next =
        next.slice(0, block.start) +
        (index === 0 ? rendered : '') +
        next.slice(block.end);
    }
    assertManagedMarkdown(next, context.document ?? 'document');
    return next;
  }
  const base =
    content.length > 0 && !content.endsWith('\n') ? `${content}\n` : content;
  const next = base + rendered;
  assertManagedMarkdown(next, context.document ?? 'document');
  return next;
}
