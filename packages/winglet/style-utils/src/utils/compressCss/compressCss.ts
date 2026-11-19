import { processCssSheet } from '../cssTokens/processCssSheet/processCssSheet';

/**
 * Compresses CSS by removing unnecessary whitespace, comments, and redundant semicolons.
 * Uses shared lexical positions without allocating token objects.
 * Prioritizes speed over perfect compression - some trailing spaces may remain.
 *
 * @param css - The CSS string to compress
 * @returns A compressed CSS string; empty comments retain boundaries between adjacent tokens
 *
 * @note This function prioritizes performance over perfect compression.
 * Some trailing spaces may remain in certain contexts (e.g., media queries)
 * to avoid expensive post-processing operations.
 *
 * @example
 * ```typescript
 * Basic CSS compression:
 * compressCss('.class { color: red; background: blue; }')
 * // Returns: '.class{color:red;background:blue}'
 *
 * Comment removal:
 * compressCss('.class { color: red; /* inline comment *\/ background: blue; }')
 * // Returns: '.class{color:red;background:blue}'
 *
 * Multiple whitespace handling:
 * compressCss('.class1   { color  :   red  ; margin :  10px   20px  ; }')
 * // Returns: '.class1{color:red;margin:10px 20px}'
 *
 * CSS selectors with combinators:
 * compressCss('.class1   .class2   >   .class3 { color: red; }')
 * // Returns: '.class1 .class2>.class3{color:red}'
 *
 * Media queries (may have trailing spaces for performance):
 * compressCss('@media (max-width: 768px) { .container { padding: 0 16px; } }')
 * // Returns: '@media (max-width:768px){.container{padding:0 16px }}' (note trailing space)
 *
 * Complex CSS with comments:
 * compressCss('.container { width: 100%; /* comment *\/ margin: 0 auto; }')
 * // Returns: '.container{width:100%;margin:0 auto}'
 *
 * Empty input:
 * compressCss('') // Returns: ''
 *```
 */
export const compressCss = (css: string): string => processCssSheet(css, true, 'none');
