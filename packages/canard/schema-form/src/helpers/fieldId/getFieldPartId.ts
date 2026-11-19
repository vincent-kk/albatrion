/** Escape base whitespace and tildes without changing ordinary scoped addresses. */
const BASE_ESCAPE = /[~\s]/g;
/** Part separators and whitespace cannot imitate the namespace delimiter. */
const PART_ESCAPE = /[~/:\s]/g;

/**
 * Derive an opaque, space-free DOM identifier from a scoped field identifier.
 * @param id - The field input's id prop; do not substitute its data path.
 * @param part - A stable role, such as label, description, error or option:0.
 * @returns An injective encoding of both strings, suitable for id, htmlFor and ARIA references.
 * CSS selectors still require CSS.escape. Neither argument is modified.
 */
export const getFieldPartId = (id: string, part: string): string =>
  id.replace(BASE_ESCAPE, escapeCharacter) +
  '~2' +
  part.replace(PART_ESCAPE, escapeCharacter);

/**
 * Encode one matched character without introducing the reserved tilde-2 sequence.
 * @param character - A tilde, slash, colon or whitespace matched by the private patterns.
 * @returns A reversible escape; whitespace ends at its semicolon.
 */
const escapeCharacter = (character: string): string =>
  character === '~'
    ? '~0'
    : character === '/'
      ? '~1'
      : character === ':'
        ? '~3'
        : '~4' + character.charCodeAt(0).toString(16) + ';';
