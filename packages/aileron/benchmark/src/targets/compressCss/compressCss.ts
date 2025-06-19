// Cached regular expressions for optimal performance
const REMOVE_COMMENTS = /\/\*[\s\S]*?\*\//g;
const NORMALIZE_WHITESPACE = /\s+/g;
const REMOVE_SPACE_AROUND_SELECTORS = /\s*([{}:;,>+~])\s*/g;
const REMOVE_SEMICOLON_BEFORE_BRACE = /;(\s*})/g;
const REMOVE_DUPLICATE_SEMICOLONS = /;+/g;
const REMOVE_TRAILING_SEMICOLON = /;\s*$/g;

/**
 * Compresses a CSS string by removing unnecessary whitespace and comments.
 *
 * This function is optimized for performance using cached regular expressions
 * and a streamlined processing approach.
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
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // 주석 제거
    .replace(/\s+/g, ' ') // 공백 압축
    .replace(/\s*([{}:;,>+~])\s*/g, '$1') // 특수문자 주변 공백 제거
    .replace(/;+/g, ';') // 중복 세미콜론 제거
    .replace(/;\s*}/g, '}') // }앞 세미콜론 제거
    .trim();
};
