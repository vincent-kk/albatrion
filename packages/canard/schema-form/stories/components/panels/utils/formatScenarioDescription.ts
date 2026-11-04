/**
 * Turn ledger-authored prose into display sentences without changing scenario data.
 * @param description - Authored prose containing ledger IDs, table references or round markers.
 * @returns Trimmed sentences with ledger markers and their empty parentheses removed.
 */
export function formatScenarioDescription(description: string): string {
  const prose = description
    .replace(/\b(?:[A-Z][A-Z0-9]*-\d{3,}[A-Z]?(?:-\d+)?|T-\d+|\d+C-\d+)\b\s*:?\s*/g, ' ')
    .replace(/(^|[^\w])\([\s,;/]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/\s+([),.:!?])/g, '$1');
  return prose.split(';').map((part) => {
    const sentence = part.trim();
    if (!sentence) return '';
    const firstWord = sentence.split(/\s+/, 1)[0].replace(/[.,:!?]+$/, '');
    const capitalized = /[().]|.[A-Z]/.test(firstWord) ? sentence : sentence.charAt(0).toUpperCase() + sentence.slice(1);
    return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
  }).filter(Boolean).join(' ');
}
