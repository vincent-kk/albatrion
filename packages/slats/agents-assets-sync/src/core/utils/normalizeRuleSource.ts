/** Normalize the source representation shared by Markdown validation and embedding.
 * @param content UTF-8 text or a reversible Latin-1 view of source bytes.
 * @returns Source without its leading BOM, with LF line endings.
 */
export function normalizeRuleSource(content: string): string {
  return content
    .replace(/^(?:\uFEFF|\xEF\xBB\xBF)/, '')
    .replace(/\r\n?/g, '\n');
}
