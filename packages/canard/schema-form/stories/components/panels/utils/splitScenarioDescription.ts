/**
 * Split authored scenario prose into display sentences without changing scenario data.
 * @param description - Authored prose containing contract labels, table references or provenance markers.
 * @returns Trimmed, capitalized sentences ending in punctuation, with provenance markers and
 * their empty parentheses removed; top-level semicolons also end a sentence.
 */
export function splitScenarioDescription(description: string): string[] {
  const marker = String.raw`\b(?:[A-Z][A-Z0-9]*-\d{3,}[A-Z]?(?:-\d+)?|T-\d+|\d+C-\d+)\b(?:·\d+)*(?:\s*\(\s*\d+\s*\))*`;
  const idList = new RegExp(`${marker}(?:\\s*(?:,\\s*(?:(?:and|or)\\s+)?|(?:and|or)\\s+)${marker})*\\s*:?`, 'g');
  const prose = description
    .replace(idList, ' ')
    .replace(/\bR[12]\b(?:,\s*(?=other-kind)|\s+(?=a\s+virtual))/g, '')
    .replace(/(^|[^\w])\(\s*(?:(?:see|per|via|cf\.?)\s*)?[,;/:\s]*\)/gi, '$1')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s*[,;]\s*\)/g, ')')
    .replace(/\s+([),.;:!?])/g, '$1');
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < prose.length; index++) {
    const char = prose[index];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (depth === 0 && (char === ';' || (/[.!?]/.test(char) && /\s|^$/.test(prose[index + 1] ?? '')))) {
      parts.push(prose.slice(start, char === ';' ? index : index + 1));
      start = index + 1;
    }
  }
  parts.push(prose.slice(start));
  return parts.map((part) => {
    const sentence = part.replace(/^(?:[\s,;:.!?]+|(?:and|or|but)\b\s*)+/i, '').trim();
    if (!sentence) return '';
    const firstWord = sentence.split(/\s+/, 1)[0].replace(/[.,:!?]+$/, '');
    const capitalized = /[().]|.[A-Z]/.test(firstWord) ? sentence : sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
  }).filter(Boolean);
}
