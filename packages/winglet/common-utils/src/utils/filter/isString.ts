/**
 * Determines whether a value is a string type with enhanced type safety.
 *
 * Provides reliable string type detection using native typeof check,
 * distinguishing primitive string values from string-like objects
 * or other data types that might contain text.
 *
 * @param value - Value to test for string type
 * @returns Type-safe boolean indicating whether the value is a string
 *
 * @example
 * Basic string detection:
 * ```typescript
 * import { isString } from '@winglet/common-utils';
 *
 * // True cases - string type
 * console.log(isString('hello')); // true
 * console.log(isString('')); // true (empty string)
 * console.log(isString('123')); // true (numeric string)
 * console.log(isString('true')); // true (boolean string)
 * console.log(isString(`template string`)); // true (template literal)
 * console.log(isString(String(42))); // true (String constructor result)
 * console.log(isString('null')); // true (string containing 'null')
 * 
 * // False cases - not string type
 * console.log(isString(123)); // false (number)
 * console.log(isString(true)); // false (boolean)
 * console.log(isString(null)); // false
 * console.log(isString(undefined)); // false
 * console.log(isString(new String('hello'))); // false (String object, not primitive)
 * console.log(isString({})); // false (object)
 * console.log(isString([])); // false (array)
 * ```
 *
 * @example
 * Form validation with string checking:
 * ```typescript
 * interface FormData {
 *   name: unknown;
 *   email: unknown;
 *   message: unknown;
 * }
 *
 * function validateStringFields(formData: FormData) {
 *   const errors: string[] = [];
 *   
 *   if (!isString(formData.name)) {
 *     errors.push('Name must be a string');
 *   } else if (formData.name.trim().length === 0) {
 *     errors.push('Name cannot be empty');
 *   }
 *   
 *   if (!isString(formData.email)) {
 *     errors.push('Email must be a string');
 *   } else if (!formData.email.includes('@')) {
 *     errors.push('Email must contain @ symbol');
 *   }
 *   
 *   if (!isString(formData.message)) {
 *     errors.push('Message must be a string');
 *   } else if (formData.message.length < 10) {
 *     errors.push('Message must be at least 10 characters');
 *   }
 *   
 *   return errors;
 * }
 * ```
 *
 * @example
 * Text processing with type safety:
 * ```typescript
 * function processText(input: unknown): string {
 *   if (!isString(input)) {
 *     throw new Error('Input must be a string');
 *   }
 *   
 *   // TypeScript knows input is string
 *   return input
 *     .trim()
 *     .toLowerCase()
 *     .replace(/\\s+/g, ' ')
 *     .split(' ')
 *     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
 *     .join(' ');
 * }
 *
 * // Usage
 * console.log(processText('  hello   world  ')); // 'Hello World'
 * // processText(123) // throws Error: Input must be a string
 * ```
 *
 * @example
 * API parameter validation:
 * ```typescript
 * interface SearchParams {
 *   query?: unknown;
 *   category?: unknown;
 *   sortBy?: unknown;
 * }
 *
 * function validateSearchParams(params: SearchParams) {
 *   const validated = {
 *     query: '',
 *     category: 'all',
 *     sortBy: 'relevance'
 *   };
 *   
 *   if (params.query !== undefined) {
 *     if (!isString(params.query)) {
 *       throw new Error('Query must be a string');
 *     }
 *     if (params.query.trim().length === 0) {
 *       throw new Error('Query cannot be empty');
 *     }
 *     validated.query = params.query.trim();
 *   }
 *   
 *   if (params.category !== undefined) {
 *     if (!isString(params.category)) {
 *       throw new Error('Category must be a string');
 *     }
 *     validated.category = params.category;
 *   }
 *   
 *   if (params.sortBy !== undefined) {
 *     if (!isString(params.sortBy)) {
 *       throw new Error('SortBy must be a string');
 *     }
 *     const allowedSorts = ['relevance', 'date', 'popularity'];
 *     if (!allowedSorts.includes(params.sortBy)) {
 *       throw new Error(`SortBy must be one of: ${allowedSorts.join(', ')}`);
 *     }
 *     validated.sortBy = params.sortBy;
 *   }
 *   
 *   return validated;
 * }
 * ```
 *
 * @example
 * Array processing with string filtering:
 * ```typescript
 * function extractStrings(values: unknown[]): string[] {
 *   return values.filter(isString);
 * }
 *
 * function processStringArray(values: unknown[]): {
 *   strings: string[];
 *   nonEmpty: string[];
 *   wordCount: number;
 *   totalLength: number;
 * } {
 *   const strings = extractStrings(values);
 *   const nonEmpty = strings.filter(s => s.trim().length > 0);
 *   
 *   const wordCount = nonEmpty.reduce((count, str) => {
 *     return count + str.trim().split(/\\s+/).length;
 *   }, 0);
 *   
 *   const totalLength = strings.reduce((sum, str) => sum + str.length, 0);
 *   
 *   return { strings, nonEmpty, wordCount, totalLength };
 * }
 *
 * // Usage
 * const mixed = ['hello', 42, 'world', null, '', 'test', true];
 * const result = processStringArray(mixed);
 * console.log(result);
 * // {
 * //   strings: ['hello', 'world', '', 'test'],
 * //   nonEmpty: ['hello', 'world', 'test'],
 * //   wordCount: 3,
 * //   totalLength: 14
 * // }
 * ```
 *
 * @example
 * Configuration validation:
 * ```typescript
 * interface Config {
 *   apiUrl?: unknown;
 *   secretKey?: unknown;
 *   environment?: unknown;
 * }
 *
 * function validateConfig(config: Config) {
 *   const errors: string[] = [];
 *   
 *   if (config.apiUrl !== undefined) {
 *     if (!isString(config.apiUrl)) {
 *       errors.push('API URL must be a string');
 *     } else if (!/^https?:\\/\\//i.test(config.apiUrl)) {
 *       errors.push('API URL must be a valid HTTP/HTTPS URL');
 *     }
 *   }
 *   
 *   if (config.secretKey !== undefined) {
 *     if (!isString(config.secretKey)) {
 *       errors.push('Secret key must be a string');
 *     } else if (config.secretKey.length < 32) {
 *       errors.push('Secret key must be at least 32 characters');
 *     }
 *   }
 *   
 *   if (config.environment !== undefined) {
 *     if (!isString(config.environment)) {
 *       errors.push('Environment must be a string');
 *     } else {
 *       const validEnvs = ['development', 'staging', 'production'];
 *       if (!validEnvs.includes(config.environment)) {
 *         errors.push(`Environment must be one of: ${validEnvs.join(', ')}`);
 *       }
 *     }
 *   }
 *   
 *   return errors;
 * }
 * ```
 *
 * @example
 * Template processing:
 * ```typescript
 * function processTemplate(template: unknown, variables: Record<string, string>) {
 *   if (!isString(template)) {
 *     throw new Error('Template must be a string');
 *   }
 *   
 *   let result = template;
 *   
 *   for (const [key, value] of Object.entries(variables)) {
 *     if (!isString(value)) {
 *       console.warn(`Variable ${key} is not a string, converting...`);
 *       const stringValue = String(value);
 *       result = result.replace(new RegExp(`\\\\{\\\\{${key}\\\\}\\\\}`, 'g'), stringValue);
 *     } else {
 *       result = result.replace(new RegExp(`\\\\{\\\\{${key}\\\\}\\\\}`, 'g'), value);
 *     }
 *   }
 *   
 *   return result;
 * }
 *
 * // Usage
 * const template = 'Hello {{name}}, you have {{count}} messages';
 * const variables = { name: 'John', count: '5' };
 * const result = processTemplate(template, variables);
 * console.log(result); // 'Hello John, you have 5 messages'
 * ```
 *
 * @remarks
 * **Important Notes:**
 * - Only detects primitive string type, not String objects
 * - Empty string (`''`) is a valid string and returns `true`
 * - Template literals are treated as regular strings
 * - String() constructor creates primitive strings when not used with `new`
 *
 * **String vs String Object:**
 * - `'hello'` is a primitive string (returns `true`)
 * - `new String('hello')` is a String object (returns `false`)
 * - Use `String(value)` for type conversion without object creation
 *
 * **Use Cases:**
 * - Form field validation
 * - API parameter validation
 * - Text processing guards
 * - Configuration validation
 * - Array filtering
 * - Template processing
 *
 * **Performance:** Direct typeof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `String()` for type conversion
 * - Use `typeof value === 'string'` for direct checking
 * - Use `isArray()` for array detection
 * - Use `isNumber()` for numeric validation
 */
export const isString = (value?: unknown): value is string =>
  typeof value === 'string';