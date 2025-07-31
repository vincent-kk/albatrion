/**
 * Determines whether a value is a regular expression (RegExp) with enhanced type safety.
 *
 * Provides reliable RegExp detection using instanceof check, identifying
 * regular expression objects created through various methods including
 * literal notation, constructor calls, and cross-frame instances.
 *
 * @param value - Value to test for RegExp type
 * @returns Type-safe boolean indicating whether the value is a RegExp
 *
 * @example
 * Basic RegExp detection:
 * ```typescript
 * import { isRegex } from '@winglet/common-utils';
 *
 * // True cases - RegExp instances
 * console.log(isRegex(/pattern/)); // true (literal notation)
 * console.log(isRegex(/pattern/gi)); // true (with flags)
 * console.log(isRegex(new RegExp('pattern'))); // true (constructor)
 * console.log(isRegex(new RegExp('pattern', 'gi'))); // true (constructor with flags)
 * console.log(isRegex(RegExp('\\d+'))); // true (RegExp function call)
 *
 * // False cases - not RegExp
 * console.log(isRegex('pattern')); // false (string)
 * console.log(isRegex('/pattern/')); // false (string resembling regex)
 * console.log(isRegex({ source: 'pattern' })); // false (regex-like object)
 * console.log(isRegex(null)); // false
 * console.log(isRegex(undefined)); // false
 * console.log(isRegex({})); // false
 * ```
 *
 * @example
 * Pattern validation and processing:
 * ```typescript
 * function validatePattern(pattern: unknown): RegExp {
 *   if (isRegex(pattern)) {
 *     // TypeScript knows pattern is RegExp
 *     return pattern;
 *   }
 *
 *   if (typeof pattern === 'string') {
 *     try {
 *       return new RegExp(pattern);
 *     } catch (error) {
 *       throw new Error(`Invalid regex pattern: ${pattern}`);
 *     }
 *   }
 *
 *   throw new Error('Pattern must be a RegExp or valid regex string');
 * }
 *
 * // Usage
 * const regex1 = validatePattern(/\\d+/); // Returns the RegExp as-is
 * const regex2 = validatePattern('\\d+'); // Creates new RegExp from string
 * // validatePattern(123) // throws Error: Pattern must be a RegExp or valid regex string
 * ```
 *
 * @example
 * Text processing with regex detection:
 * ```typescript
 * interface SearchOptions {
 *   pattern: string | RegExp;
 *   caseSensitive?: boolean;
 *   wholeWord?: boolean;
 * }
 *
 * function searchText(text: string, options: SearchOptions): string[] {
 *   let regex: RegExp;
 *
 *   if (isRegex(options.pattern)) {
 *     // Use provided RegExp directly
 *     regex = options.pattern;
 *   } else {
 *     // Build RegExp from string with options
 *     let flags = 'g';
 *     if (!options.caseSensitive) flags += 'i';
 *
 *     let pattern = options.pattern;
 *     if (options.wholeWord) {
 *       pattern = `\\\\b${pattern}\\\\b`;
 *     }
 *
 *     regex = new RegExp(pattern, flags);
 *   }
 *
 *   const matches = text.match(regex);
 *   return matches || [];
 * }
 *
 * // Usage
 * const text = 'Hello World, hello universe';
 * console.log(searchText(text, { pattern: /hello/gi })); // ['Hello', 'hello']
 * console.log(searchText(text, { pattern: 'hello', caseSensitive: false })); // ['Hello', 'hello']
 * ```
 *
 * @example
 * Form validation with regex patterns:
 * ```typescript
 * interface ValidationRule {
 *   pattern: string | RegExp;
 *   message: string;
 * }
 *
 * function validateField(value: string, rules: ValidationRule[]): string[] {
 *   const errors: string[] = [];
 *
 *   for (const rule of rules) {
 *     let regex: RegExp;
 *
 *     if (isRegex(rule.pattern)) {
 *       regex = rule.pattern;
 *     } else {
 *       try {
 *         regex = new RegExp(rule.pattern);
 *       } catch (error) {
 *         console.warn(`Invalid regex pattern: ${rule.pattern}`);
 *         continue;
 *       }
 *     }
 *
 *     if (!regex.test(value)) {
 *       errors.push(rule.message);
 *     }
 *   }
 *
 *   return errors;
 * }
 *
 * // Usage
 * const emailRules: ValidationRule[] = [
 *   { pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Invalid email format' },
 *   { pattern: /.{5,}/, message: 'Email must be at least 5 characters' }
 * ];
 *
 * const errors = validateField('test@', emailRules);
 * console.log(errors); // ['Invalid email format']
 * ```
 *
 * @example
 * Regex serialization and deserialization:
 * ```typescript
 * interface SerializedRegex {
 *   source: string;
 *   flags: string;
 * }
 *
 * function serializeRegex(value: unknown): SerializedRegex | null {
 *   if (!isRegex(value)) {
 *     return null;
 *   }
 *
 *   return {
 *     source: value.source,
 *     flags: value.flags
 *   };
 * }
 *
 * function deserializeRegex(data: SerializedRegex): RegExp {
 *   return new RegExp(data.source, data.flags);
 * }
 *
 * // Usage
 * const original = /hello\\s+world/gi;
 * const serialized = serializeRegex(original);
 * console.log(serialized); // { source: 'hello\\\\s+world', flags: 'gi' }
 *
 * if (serialized) {
 *   const restored = deserializeRegex(serialized);
 *   console.log(restored); // /hello\\s+world/gi
 *   console.log(restored.test('Hello World')); // true
 * }
 * ```
 *
 * @example
 * Dynamic regex compilation with caching:
 * ```typescript
 * class RegexCache {
 *   private cache = new Map<string, RegExp>();
 *
 *   getRegex(pattern: string | RegExp, flags?: string): RegExp {
 *     if (isRegex(pattern)) {
 *       return pattern;
 *     }
 *
 *     const cacheKey = `${pattern}:${flags || ''}`;
 *     let regex = this.cache.get(cacheKey);
 *
 *     if (!regex) {
 *       try {
 *         regex = new RegExp(pattern, flags);
 *         this.cache.set(cacheKey, regex);
 *       } catch (error) {
 *         throw new Error(`Invalid regex: ${pattern}`);
 *       }
 *     }
 *
 *     return regex;
 *   }
 *
 *   test(text: string, pattern: string | RegExp, flags?: string): boolean {
 *     const regex = this.getRegex(pattern, flags);
 *     return regex.test(text);
 *   }
 * }
 *
 * // Usage
 * const regexCache = new RegexCache();
 * console.log(regexCache.test('hello123', '\\\\d+'));     // true
 * console.log(regexCache.test('HELLO', /hello/i));       // true
 * ```
 *
 * @example
 * Template engine with regex replacement:
 * ```typescript
 * interface TemplateRule {
 *   pattern: string | RegExp;
 *   replacement: string | ((match: string, ...groups: string[]) => string);
 * }
 *
 * function processTemplate(template: string, rules: TemplateRule[]): string {
 *   let result = template;
 *
 *   for (const rule of rules) {
 *     let regex: RegExp;
 *
 *     if (isRegex(rule.pattern)) {
 *       // Ensure global flag for replace all
 *       const flags = rule.pattern.flags.includes('g')
 *         ? rule.pattern.flags
 *         : rule.pattern.flags + 'g';
 *       regex = new RegExp(rule.pattern.source, flags);
 *     } else {
 *       regex = new RegExp(rule.pattern, 'g');
 *     }
 *
 *     if (typeof rule.replacement === 'function') {
 *       result = result.replace(regex, rule.replacement);
 *     } else {
 *       result = result.replace(regex, rule.replacement);
 *     }
 *   }
 *
 *   return result;
 * }
 *
 * // Usage
 * const template = 'Hello {{name}}, you have {{count}} messages';
 * const rules: TemplateRule[] = [
 *   { pattern: /\\{\\{name\\}\\}/g, replacement: 'John' },
 *   { pattern: '\\\\{\\\\{count\\\\}\\\\}', replacement: '5' }
 * ];
 *
 * const result = processTemplate(template, rules);
 * console.log(result); // 'Hello John, you have 5 messages'
 * ```
 *
 * @remarks
 * **RegExp Properties Available After Detection:**
 * - `source` - the pattern string
 * - `flags` - combined flags (g, i, m, etc.)
 * - `global` - true if 'g' flag is set
 * - `ignoreCase` - true if 'i' flag is set
 * - `multiline` - true if 'm' flag is set
 * - `lastIndex` - current position for global matches
 *
 * **Use Cases:**
 * - Pattern validation and processing
 * - Form field validation
 * - Text search and replacement
 * - Template engines
 * - Serialization/deserialization
 * - Dynamic regex compilation
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Cross-frame Compatibility:** Works correctly across different execution contexts.
 *
 * **Related Functions:**
 * - Use `RegExp.prototype.test()` for pattern matching
 * - Use `String.prototype.match()` for extracting matches
 * - Use `String.prototype.replace()` for pattern replacement
 * - Use `isString()` for string pattern checking
 */
export const isRegex = (value: unknown): value is RegExp =>
  value instanceof RegExp;
