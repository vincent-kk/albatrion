/**
 * Determines whether a regex pattern string is valid with enhanced safety.
 *
 * Validates regex pattern strings by attempting to construct a RegExp object,
 * providing safe pattern validation without throwing exceptions. Useful for
 * user input validation and dynamic regex compilation scenarios.
 *
 * @param pattern - String to test as a valid regex pattern
 * @returns Type-safe boolean indicating whether the pattern is valid
 *
 * @example
 * Basic regex pattern validation:
 * ```typescript
 * import { isValidRegexPattern } from '@winglet/common-utils';
 *
 * // True cases - valid patterns
 * console.log(isValidRegexPattern('hello')); // true (simple string)
 * console.log(isValidRegexPattern('\\d+')); // true (digits)
 * console.log(isValidRegexPattern('[a-z]+')); // true (character class)
 * console.log(isValidRegexPattern('(foo|bar)')); // true (alternation)
 * console.log(isValidRegexPattern('^start.*end$')); // true (anchors)
 * console.log(isValidRegexPattern('\\w{2,5}')); // true (quantifiers)
 * console.log(isValidRegexPattern('')); // true (empty pattern)
 * 
 * // False cases - invalid patterns
 * console.log(isValidRegexPattern('[')); // false (unclosed bracket)
 * console.log(isValidRegexPattern('(')); // false (unclosed parenthesis)
 * console.log(isValidRegexPattern('*')); // false (invalid quantifier)
 * console.log(isValidRegexPattern('(?')); // false (incomplete group)
 * console.log(isValidRegexPattern('\\x')); // false (incomplete escape)
 * console.log(isValidRegexPattern('{5,2}')); // false (invalid range)
 * ```
 *
 * @example
 * User input validation:
 * ```typescript
 * interface SearchForm {
 *   query: string;
 *   useRegex: boolean;
 *   caseSensitive: boolean;
 * }
 *
 * function validateSearchForm(form: SearchForm): string[] {
 *   const errors: string[] = [];
 *   
 *   if (!form.query.trim()) {
 *     errors.push('Search query cannot be empty');
 *   }
 *   
 *   if (form.useRegex && !isValidRegexPattern(form.query)) {
 *     errors.push('Invalid regular expression pattern');
 *   }
 *   
 *   return errors;
 * }
 *
 * function performSearch(form: SearchForm, text: string): string[] {
 *   const validation = validateSearchForm(form);
 *   if (validation.length > 0) {
 *     throw new Error(`Form validation failed: ${validation.join(', ')}`);
 *   }
 *   
 *   let regex: RegExp;
 *   
 *   if (form.useRegex) {
 *     // We know it's valid because we validated it
 *     const flags = form.caseSensitive ? 'g' : 'gi';
 *     regex = new RegExp(form.query, flags);
 *   } else {
 *     // Escape special regex characters for literal search
 *     const escaped = form.query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
 *     const flags = form.caseSensitive ? 'g' : 'gi';
 *     regex = new RegExp(escaped, flags);
 *   }
 *   
 *   return text.match(regex) || [];
 * }
 * ```
 *
 * @example
 * Dynamic regex builder with validation:
 * ```typescript
 * class RegexBuilder {
 *   private patterns: string[] = [];
 *   
 *   add(pattern: string): this {
 *     if (!isValidRegexPattern(pattern)) {
 *       throw new Error(`Invalid regex pattern: ${pattern}`);
 *     }
 *     this.patterns.push(pattern);
 *     return this;
 *   }
 *   
 *   combine(operator: '|' | '&' = '|'): RegExp {
 *     if (this.patterns.length === 0) {
 *       throw new Error('No patterns added to builder');
 *     }
 *     
 *     let combined: string;
 *     
 *     if (operator === '|') {
 *       // OR operation - alternation
 *       combined = `(${this.patterns.join('|')})`;
 *     } else {
 *       // AND operation - lookaheads
 *       const lookaheads = this.patterns.map(p => `(?=.*${p})`).join('');
 *       combined = `${lookaheads}.*`;
 *     }
 *     
 *     if (!isValidRegexPattern(combined)) {
 *       throw new Error('Generated pattern is invalid');
 *     }
 *     
 *     return new RegExp(combined);
 *   }
 *   
 *   validate(): { valid: boolean; errors: string[] } {
 *     const errors: string[] = [];
 *     
 *     this.patterns.forEach((pattern, index) => {
 *       if (!isValidRegexPattern(pattern)) {
 *         errors.push(`Pattern ${index + 1} is invalid: ${pattern}`);
 *       }
 *     });
 *     
 *     return {
 *       valid: errors.length === 0,
 *       errors
 *     };
 *   }
 * }
 *
 * // Usage
 * const builder = new RegexBuilder();
 * builder.add('\\\\d+').add('[a-z]+').add('test');
 * const regex = builder.combine('|'); // Matches digits OR letters OR 'test'
 * ```
 *
 * @example
 * Configuration validation:
 * ```typescript
 * interface RegexConfig {
 *   patterns: string[];
 *   flags?: string;
 *   enabled: boolean;
 * }
 *
 * function validateRegexConfig(config: RegexConfig): {
 *   valid: boolean;
 *   errors: string[];
 *   compiledPatterns?: RegExp[];
 * } {
 *   const errors: string[] = [];
 *   const compiledPatterns: RegExp[] = [];
 *   
 *   if (!config.enabled) {
 *     return { valid: true, errors: [], compiledPatterns: [] };
 *   }
 *   
 *   if (!Array.isArray(config.patterns) || config.patterns.length === 0) {
 *     errors.push('Patterns array is required and cannot be empty');
 *     return { valid: false, errors };
 *   }
 *   
 *   config.patterns.forEach((pattern, index) => {
 *     if (typeof pattern !== 'string') {
 *       errors.push(`Pattern ${index + 1} must be a string`);
 *       return;
 *     }
 *     
 *     if (!isValidRegexPattern(pattern)) {
 *       errors.push(`Pattern ${index + 1} is invalid: ${pattern}`);
 *       return;
 *     }
 *     
 *     try {
 *       const regex = new RegExp(pattern, config.flags);
 *       compiledPatterns.push(regex);
 *     } catch (error) {
 *       errors.push(`Pattern ${index + 1} failed to compile with flags: ${error.message}`);
 *     }
 *   });
 *   
 *   return {
 *     valid: errors.length === 0,
 *     errors,
 *     compiledPatterns: errors.length === 0 ? compiledPatterns : undefined
 *   };
 * }
 * ```
 *
 * @example
 * Text processor with pattern validation:
 * ```typescript
 * interface TextRule {
 *   name: string;
 *   pattern: string;
 *   replacement: string;
 *   flags?: string;
 * }
 *
 * class TextProcessor {
 *   private rules: Array<{ name: string; regex: RegExp; replacement: string }> = [];
 *   
 *   addRule(rule: TextRule): void {
 *     if (!isValidRegexPattern(rule.pattern)) {
 *       throw new Error(`Invalid pattern in rule '${rule.name}': ${rule.pattern}`);
 *     }
 *     
 *     try {
 *       const regex = new RegExp(rule.pattern, rule.flags || 'g');
 *       this.rules.push({
 *         name: rule.name,
 *         regex,
 *         replacement: rule.replacement
 *       });
 *     } catch (error) {
 *       throw new Error(`Failed to compile rule '${rule.name}': ${error.message}`);
 *     }
 *   }
 *   
 *   validateRules(rules: TextRule[]): { valid: TextRule[]; invalid: Array<{ rule: TextRule; error: string }> } {
 *     const valid: TextRule[] = [];
 *     const invalid: Array<{ rule: TextRule; error: string }> = [];
 *     
 *     rules.forEach(rule => {
 *       if (!isValidRegexPattern(rule.pattern)) {
 *         invalid.push({ rule, error: 'Invalid regex pattern' });
 *         return;
 *       }
 *       
 *       try {
 *         new RegExp(rule.pattern, rule.flags);
 *         valid.push(rule);
 *       } catch (error) {
 *         invalid.push({ rule, error: error.message });
 *       }
 *     });
 *     
 *     return { valid, invalid };
 *   }
 *   
 *   process(text: string): string {
 *     let result = text;
 *     
 *     this.rules.forEach(rule => {
 *       result = result.replace(rule.regex, rule.replacement);
 *     });
 *     
 *     return result;
 *   }
 * }
 * ```
 *
 * @example
 * Pattern testing utility:
 * ```typescript
 * function testRegexPattern(pattern: string, testStrings: string[]) {
 *   if (!isValidRegexPattern(pattern)) {
 *     return {
 *       valid: false,
 *       error: 'Invalid regex pattern',
 *       results: []
 *     };
 *   }
 *   
 *   try {
 *     const regex = new RegExp(pattern, 'g');
 *     const results = testStrings.map(str => ({
 *       input: str,
 *       matches: str.match(regex) || [],
 *       hasMatch: regex.test(str)
 *     }));
 *     
 *     return {
 *       valid: true,
 *       error: null,
 *       results
 *     };
 *   } catch (error) {
 *     return {
 *       valid: false,
 *       error: error.message,
 *       results: []
 *     };
 *   }
 * }
 *
 * // Usage
 * const testResult = testRegexPattern('\\\\d+', ['abc', '123', 'test456']);
 * console.log(testResult);
 * // {
 * //   valid: true,
 * //   error: null,
 * //   results: [
 * //     { input: 'abc', matches: [], hasMatch: false },
 * //     { input: '123', matches: ['123'], hasMatch: true },
 * //     { input: 'test456', matches: ['456'], hasMatch: true }
 * //   ]
 * // }
 * ```
 *
 * @remarks
 * **Validation Method:**
 * - Uses try-catch with RegExp constructor
 * - Safe - never throws exceptions
 * - Returns false for any pattern that would cause RegExp to throw
 * - Does not validate semantic correctness, only syntactic validity
 *
 * **Common Invalid Patterns:**
 * - Unclosed character classes: `[abc`
 * - Unclosed groups: `(pattern`
 * - Invalid quantifiers: `*`, `{5,2}`
 * - Incomplete escapes: `\\x`, `\\u`
 * - Invalid unicode escapes: `\\u{}`
 *
 * **Use Cases:**
 * - User input validation (search forms, configuration)
 * - Dynamic regex compilation
 * - Pattern builder utilities
 * - Configuration file validation
 * - Text processing rule validation
 *
 * **Performance:** 
 * - Lightweight validation using native RegExp constructor
 * - Early return on construction success
 * - Exception handling overhead only for invalid patterns
 *
 * **Related Functions:**
 * - Use `isRegex()` to check for existing RegExp objects
 * - Use `RegExp()` constructor for actual pattern compilation
 * - Use `isString()` for basic string validation
 */
export const isValidRegexPattern = (pattern: string): pattern is string => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};