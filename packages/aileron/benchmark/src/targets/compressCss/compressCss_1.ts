// Cached regular expressions for optimal performance
const REMOVE_COMMENTS = /\/\*[\s\S]*?\*\//g;
const NORMALIZE_WHITESPACE = /\s+/g;
const REMOVE_SPACE_AROUND_SELECTORS = /\s*([{}:;,>+~])\s*/g;
const REMOVE_SEMICOLON_BEFORE_BRACE = /;(\s*})/g;
const REMOVE_DUPLICATE_SEMICOLONS = /;+/g;
const REMOVE_TRAILING_SEMICOLON = /;\s*$/g;

// Single-pass regex for small CSS strings
const COMPRESS_SMALL_CSS = /\/\*[\s\S]*?\*\/|\s*([{}:;,>+~])\s*|\s+/g;

// Performance thresholds
const SMALL_CSS_THRESHOLD = 1000; // characters

/**
 * Compresses a CSS string by removing unnecessary whitespace and comments.
 *
 * This function uses an adaptive approach: single-pass regex for small strings,
 * optimized character scanning for larger strings to maximize performance.
 *
 * @example
 * ```typescript
 * const compressed = compressCss('.container { color: red; }');
 * // Returns: '.container{color:red}'
 * ```
 *
 * @param css - CSS string to compress
 * @returns Compressed CSS string
 */
export const compressCss = (css: string): string => {
  if (!css || css.length === 0) return '';

  // Fast path for small CSS strings using single-pass regex
  if (css.length <= SMALL_CSS_THRESHOLD) {
    return css
      .replace(COMPRESS_SMALL_CSS, (match, group1) => {
        // If it's a comment, remove it
        if (match.startsWith('/*')) return '';
        // If it's a captured delimiter, return it without spaces
        if (group1) return group1;
        // If it's whitespace, replace with single space
        return ' ';
      })
      .replace(/;\s*}/g, '}') // Remove semicolon before }
      .replace(/;+/g, ';') // Remove duplicate semicolons
      .trim();
  }

  // Optimized path for larger CSS strings using character scanning
  return compressCssOptimized(css);
};

/**
 * Optimized compression for larger CSS strings using character-by-character scanning.
 * This approach is faster than multiple regex passes for large strings.
 */
const compressCssOptimized = (css: string): string => {
  const len = css.length;
  let result = '';
  let i = 0;
  let inComment = false;
  let prevChar = '';
  let skipSpace = false;

  while (i < len) {
    const char = css[i];
    const nextChar = css[i + 1] || '';

    // Handle comments
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

    // Handle whitespace
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      // Skip consecutive whitespace
      while (i < len && /\s/.test(css[i])) i++;

      // Check if we need to keep a space
      const prevNonSpace = prevChar;
      const nextNonSpace = css[i] || '';

      // Don't add space around CSS delimiters
      if (
        !prevNonSpace ||
        /[{}:;,>+~]/.test(prevNonSpace) ||
        /[{}:;,>+~]/.test(nextNonSpace) ||
        (prevNonSpace === ')' && nextNonSpace !== '(')
      ) {
        skipSpace = true;
      } else if (/[a-zA-Z]/.test(prevNonSpace) && nextNonSpace === '(') {
        // Keep space between letters and opening parenthesis
        result += ' ';
        prevChar = ' ';
      } else if (prevNonSpace && nextNonSpace && !skipSpace) {
        result += ' ';
        prevChar = ' ';
      }

      skipSpace = false;
      continue;
    }

    // Handle semicolons
    if (char === ';') {
      // Skip duplicate semicolons
      while (i < len && css[i] === ';') i++;

      // Check if next non-whitespace character is }
      let j = i;
      while (j < len && /\s/.test(css[j])) j++;

      if (j < len && css[j] === '}') {
        // Skip semicolon before }
        continue;
      }

      result += ';';
      prevChar = ';';
      continue;
    }

    // Regular character
    result += char;
    prevChar = char;
    i++;
  }

  // Clean up trailing semicolon
  return result.replace(/;\s*$/, '');
};
