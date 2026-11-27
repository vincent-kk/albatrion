/** Parse description text from JSDoc (text before the first @tag). */
export function parseDescription(jsdoc: string): string {
  const lines = jsdoc.split('\n');
  const descLines: string[] = [];

  for (const line of lines) {
    const stripped = line.replace(/^\s*\/\*\*\s*/, '').replace(/\s*\*\/\s*$/, '').replace(/^\s*\*\s?/, '').trim();
    if (stripped.startsWith('@')) break;
    if (stripped) descLines.push(stripped);
  }

  return descLines.join('\n');
}
