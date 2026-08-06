import * as fs from 'node:fs';

const FOR_AI_OPEN = '<ForAI>';
const FOR_AI_CLOSE = '</ForAI>';
const AUTO_MARKER = '<!-- sync-api-docs:auto -->';
const FOR_AI_IMPORT = "import ForAI from '@site/src/components/ForAI';";
const FOR_AI_IMPORT_PATTERN = /^import\s+ForAI\s+from\s+.+;$/m;

/**
 * Check if the ForAI section is auto-generated (has the marker).
 * Returns:
 *  - 'auto': has marker, safe to overwrite
 *  - 'manual': ForAI exists but no marker, skip
 *  - 'none': no ForAI section exists
 */
export function getForAIStatus(mdxPath: string): 'auto' | 'manual' | 'none' {
  const content = fs.readFileSync(mdxPath, 'utf-8');

  const openIdx = content.indexOf(FOR_AI_OPEN);
  const closeIdx = content.indexOf(FOR_AI_CLOSE);

  if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) {
    return 'none';
  }

  const forAIContent = content.substring(openIdx, closeIdx);
  return forAIContent.includes(AUTO_MARKER) ? 'auto' : 'manual';
}

/**
 * Update the <ForAI>...</ForAI> section in an MDX file.
 * Only updates if the section is auto-generated (has marker) or missing.
 * Hand-written ForAI sections (without marker) are never touched.
 *
 * Returns: 'updated' | 'unchanged' | 'skipped'
 */
export function updateMdxForAI(
  mdxPath: string,
  newForAIContent: string,
): 'updated' | 'unchanged' | 'skipped' {
  const original = fs.readFileSync(mdxPath, 'utf-8');

  const openIdx = original.indexOf(FOR_AI_OPEN);
  const closeIdx = original.indexOf(FOR_AI_CLOSE);

  const hasForAI = openIdx !== -1 && closeIdx !== -1 && closeIdx > openIdx;

  // If ForAI exists but is hand-written, skip
  if (hasForAI) {
    const existingContent = original.substring(openIdx, closeIdx);
    if (!existingContent.includes(AUTO_MARKER)) {
      return 'skipped';
    }
  }

  const markedContent = AUTO_MARKER + '\n' + newForAIContent;

  let updated: string;

  if (hasForAI) {
    // Replace existing auto-generated ForAI section
    const before = original.substring(0, openIdx + FOR_AI_OPEN.length);
    const after = original.substring(closeIdx);
    updated = before + '\n' + markedContent + '\n' + after;
  } else {
    // No existing ForAI section — append at end of file
    const trimmed = original.trimEnd();
    updated =
      trimmed +
      '\n\n' +
      FOR_AI_OPEN +
      '\n' +
      markedContent +
      '\n' +
      FOR_AI_CLOSE +
      '\n';
  }

  updated = ensureForAIImport(updated);

  // Normalize trailing newline
  if (!updated.endsWith('\n')) {
    updated += '\n';
  }

  if (original === updated) {
    return 'unchanged';
  }

  fs.writeFileSync(mdxPath, updated, 'utf-8');
  return 'updated';
}

/**
 * Ensure the page imports `ForAI` before a generated block references it.
 *
 * The generated section is a component call, and MDX fails the build when the
 * component is not in scope — a page that never carried a ForAI section has no
 * such import. Docusaurus takes imports after the frontmatter, so the line goes
 * after the last existing import, or straight after the frontmatter. Only the
 * head is searched: the generated block's own code fence holds `import` lines
 * too, and anchoring to one of those would file the statement inside it.
 *
 * @param content - full MDX source
 * @returns the source with the import present; unchanged when it already is
 */
function ensureForAIImport(content: string): string {
  if (FOR_AI_IMPORT_PATTERN.test(content)) return content;
  const headEnd = content.search(/^#\s/m);
  const head = headEnd === -1 ? content : content.slice(0, headEnd);
  const lastImport = [...head.matchAll(/^import .+;$/gm)].at(-1);
  const at = lastImport
    ? (lastImport.index ?? 0) + lastImport[0].length
    : (head.match(/^---\n[\s\S]*?\n---\n/)?.[0].length ?? 0);
  return `${content.slice(0, at)}\n${FOR_AI_IMPORT}${content.slice(at)}`;
}

/**
 * Read the current ForAI content from an MDX file.
 * Returns null if no ForAI section exists.
 */
export function readCurrentForAI(mdxPath: string): string | null {
  const content = fs.readFileSync(mdxPath, 'utf-8');

  const openIdx = content.indexOf(FOR_AI_OPEN);
  const closeIdx = content.indexOf(FOR_AI_CLOSE);

  if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) {
    return null;
  }

  // Strip auto marker for comparison
  return content
    .substring(openIdx + FOR_AI_OPEN.length, closeIdx)
    .replace(AUTO_MARKER, '')
    .trim();
}
