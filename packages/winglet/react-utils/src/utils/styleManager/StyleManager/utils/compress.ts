export const compress = (css: string): string => {
  let result = removeCommentsAndNormalizeSpaces(css);
  result = removeUnnecessarySemicolons(result);
  return result.trim();
};

const WHITESPACE_CHARS = new Set([' ', '\t', '\n', '\r']);
const SPECIAL_CHARS = new Set(['{', '}', ';', ':', ',']);
const SELECTOR_OPERATORS = new Set(['>', '+', '~']);

/**
 * Removes CSS comments and normalizes whitespace while preserving necessary spaces.
 *
 * @param css - The CSS string to process
 * @returns CSS string with comments removed and whitespace normalized
 */
const removeCommentsAndNormalizeSpaces = (css: string): string => {
  let result = '';
  let inComment = false;
  let i = 0;

  while (i < css.length) {
    const char = css[i];
    const nextChar = css[i + 1] || '';
    if (!inComment && char === '/' && nextChar === '*') {
      inComment = true;
      i += 2;
      continue;
    }
    if (inComment && char === '*' && nextChar === '/') {
      inComment = false;
      i += 2;
      continue;
    }
    if (inComment) {
      i++;
      continue;
    }
    if (WHITESPACE_CHARS.has(char)) {
      let hasSpace = false;
      while (i < css.length && WHITESPACE_CHARS.has(css[i])) {
        hasSpace = true;
        i++;
      }
      if (!hasSpace) {
        i++;
        continue;
      }
      const afterSpaceChar = css[i] || '';
      const lastResultChar = result[result.length - 1] || '';
      const needsSpace = shouldKeepSpace(lastResultChar, afterSpaceChar);
      if (needsSpace) result += ' ';
      continue;
    }
    result += char;
    i++;
  }

  return result;
};

/**
 * Removes unnecessary semicolons including duplicates and semicolons before closing braces.
 *
 * @param css - The CSS string to process
 * @returns CSS string with unnecessary semicolons removed
 */
const removeUnnecessarySemicolons = (css: string): string => {
  let result = '';
  let index = 0;
  const length = css.length;
  while (index < length) {
    const char = css[index];
    if (char === ';') {
      result += ';';
      while (index + 1 < css.length && css[index + 1] === ';') index++;
    } else result += char;
    index++;
  }
  let finalResult = '';
  index = 0;
  while (index < result.length) {
    const char = result[index];
    if (char === ';') {
      let j = index + 1;
      while (j < result.length && WHITESPACE_CHARS.has(result[j])) j++;
      if (j < result.length && result[j] === '}') {
        index = j;
        continue;
      }
    }
    finalResult += char;
    index++;
  }
  return finalResult;
};

/**
 * Checks if a character is a letter (A-Z or a-z).
 *
 * @param char - The character to check
 * @returns True if the character is a letter, false otherwise
 */
const isLetter = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
};

/**
 * Determines whether a space should be preserved between two characters in CSS.
 *
 * This function ensures that spaces are kept only when necessary for CSS syntax,
 * such as between selectors, function parameters, or when separating identifiers.
 *
 * @param before - The character before the space
 * @param after - The character after the space
 * @returns True if the space should be preserved, false otherwise
 */
const shouldKeepSpace = (before: string, after: string): boolean => {
  if (!before || !after) return false;
  if (SPECIAL_CHARS.has(before) || SPECIAL_CHARS.has(after)) return false;
  if (SELECTOR_OPERATORS.has(before) || SELECTOR_OPERATORS.has(after))
    return false;
  if (before === ')' && after !== '(') return false;
  if (after === '(' && isLetter(before)) return true;
  return true;
};
