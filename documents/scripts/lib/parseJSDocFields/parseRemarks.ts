/** Parse @remarks text from JSDoc. */
export function parseRemarks(jsdoc: string): string | undefined {
  const remarksRegex = /@remarks\s+([\s\S]*?)(?=\n\s*\*\s*@(?!remarks)|\n\s*\*\/)/;
  const match = jsdoc.match(remarksRegex);
  if (!match) return undefined;

  const text = match[1]
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();

  return text || undefined;
}
