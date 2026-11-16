const INLINE_LINK_TAG = /\{@(link|linkcode|linkplain)\s+([^\s|}]+)\s*\|?\s*([^}]*)\}/g;
const INLINE_CODE_SPAN = /(`+[^`]*`+)/;

/**
 * Make JSDoc prose safe to embed in an MDX page.
 *
 * MDX reads `{...}` as an expression and `<name` as a JSX tag, so prose taken
 * from a documentation comment can stop the page from compiling. Inline link
 * tags become their label, or their target in a code span when they have none;
 * remaining braces and tag-opening angle brackets are escaped.
 *
 * @param text - Prose from a documentation comment; may span lines and contain
 *   fenced code blocks and inline code spans, which are returned unchanged.
 * @returns The prose with the same line structure.
 */
export function escapeMdxProse(text: string): string {
  let inCodeBlock = false;
  return text
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      return inCodeBlock ? line : escapeLine(line);
    })
    .join('\n');
}

/** Escape one prose line, leaving its inline code spans as written. */
function escapeLine(line: string): string {
  return line
    .split(INLINE_CODE_SPAN)
    .map((segment, index) => (index % 2 === 1 ? segment : escapeSegment(segment)))
    .join('');
}

/** Rewrite inline link tags, then escape what MDX would still parse as syntax. */
function escapeSegment(segment: string): string {
  return segment
    .replace(INLINE_LINK_TAG, (_tag, kind: string, target: string, label: string) => {
      const text = label.trim();
      if (!text) return `\`${target}\``;
      return kind === 'linkcode' ? `\`${text}\`` : text;
    })
    .replace(/[{}]/g, brace => `\\${brace}`)
    .replace(/<(?=[\w\d])/g, '&lt;');
}
