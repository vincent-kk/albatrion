/** Lowercase identifiers joined by hyphens, dots or underscores, such as `reference-schema`. */
const SEPARATED_LOWERCASE = /^[a-z0-9]+(?:[-._][a-z0-9]+)*$/;
/** A single PascalCase token with at least two words, such as `EmptyAndClear` or `CX01OrderForm`. */
const COMPOUND_PASCAL_CASE = /^[A-Z][A-Za-z0-9]*[a-z0-9][A-Z][A-Za-z0-9]*$/;
/** An acronym or code such as `CX01` keeps its case; ordinary words become lowercase. */
const KEPT_CASE_WORD = /^(?:[A-Z]{2,}|[A-Z]+\d+)[A-Z0-9]*$/;
/** Split JSON Schema keywords, matched in the lowercased label. */
const SCHEMA_KEYWORD = /\b(?:one ?of|any ?of|all ?of|if then else)\b/g;
/** Display form of each keyword: identifiers read as schema keywords, never as English words. */
const SCHEMA_KEYWORD_TEXT: Readonly<Record<string, string>> = {
  'one of': 'oneOf', oneof: 'oneOf', 'any of': 'anyOf', anyof: 'anyOf',
  'all of': 'allOf', allof: 'allOf', 'if then else': 'if/then/else',
};

/**
 * Split a transformable label into its words.
 * @param label - A raw title segment or story name.
 * @returns The words of a separated-lowercase or compound PascalCase label, otherwise undefined.
 */
function toWords(label: string): string[] | undefined {
  if (SEPARATED_LOWERCASE.test(label)) return label.split(/[-._]+/);
  if (!COMPOUND_PASCAL_CASE.test(label)) return undefined;
  return label
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ');
}

/**
 * Turn a Storybook title segment or story name into a sentence-case display label.
 * Story IDs derive from the raw value, so callers only change what is shown.
 * @param label - A raw segment; labels that already contain spaces are authored text.
 * @returns `reference-schema` → `Reference schema`, `EmptyAndClear` → `Empty and clear`,
 * `CX01OrderForm` → `CX01 order form`, `OneOfWithAnyOf` → `oneOf with anyOf`;
 * single-word PascalCase and spaced labels are returned unchanged.
 */
export function toDisplayLabel(label: string): string {
  const words = toWords(label);
  if (!words) return label;
  const sentence = words
    .map((word) => (KEPT_CASE_WORD.test(word) ? word : word.toLowerCase()))
    .join(' ');
  const startsWithKeyword = sentence.search(SCHEMA_KEYWORD) === 0;
  const display = sentence.replace(SCHEMA_KEYWORD, (keyword) => SCHEMA_KEYWORD_TEXT[keyword]);
  return startsWithKeyword ? display : display.charAt(0).toUpperCase() + display.slice(1);
}
