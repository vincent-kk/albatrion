import * as fs from 'node:fs';

const FOR_AI_OPEN = '<ForAI>';
const FOR_AI_CLOSE = '</ForAI>';
const AUTO_MARKER = '<!-- sync-api-docs:auto -->';

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
    updated = trimmed + '\n\n' + FOR_AI_OPEN + '\n' + markedContent + '\n' + FOR_AI_CLOSE + '\n';
  }

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
