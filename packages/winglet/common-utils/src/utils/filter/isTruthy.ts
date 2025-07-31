/**
 * Determines whether a value is truthy with enhanced type safety.
 *
 * Provides reliable truthy value detection using double negation,
 * excluding all falsy values (false, null, undefined, '', 0, NaN)
 * and providing TypeScript type narrowing to exclude falsy types.
 *
 * @template T - The input type
 * @param value - Value to test for truthy characteristics
 * @returns Type-safe boolean indicating whether the value is truthy
 *
 * @example
 * Basic truthy detection:
 * ```typescript
 * import { isTruthy } from '@winglet/common-utils';
 *
 * // True cases - truthy values
 * console.log(isTruthy('hello')); // true (non-empty string)
 * console.log(isTruthy('0')); // true (string containing '0')
 * console.log(isTruthy(1)); // true (positive number)
 * console.log(isTruthy(-1)); // true (negative number)
 * console.log(isTruthy(true)); // true (boolean true)
 * console.log(isTruthy({})); // true (object)
 * console.log(isTruthy([])); // true (array)
 * console.log(isTruthy(new Date())); // true (Date object)
 * console.log(isTruthy(() => {})); // true (function)
 * console.log(isTruthy(Infinity)); // true (Infinity)
 * console.log(isTruthy(Symbol('test'))); // true (symbol)
 * 
 * // False cases - falsy values
 * console.log(isTruthy(false)); // false
 * console.log(isTruthy(null)); // false
 * console.log(isTruthy(undefined)); // false
 * console.log(isTruthy('')); // false (empty string) 
 * console.log(isTruthy(0)); // false (zero)
 * console.log(isTruthy(NaN)); // false
 * ```
 *
 * @example
 * Array filtering with type safety:
 * ```typescript
 * function filterTruthyValues<T>(array: T[]): Array<Exclude<T, Falsy>> {
 *   return array.filter(isTruthy);
 * }
 *
 * // Usage
 * const mixed = ['hello', '', 0, 42, null, 'world', undefined, false, true];
 * const truthyOnly = filterTruthyValues(mixed);
 * console.log(truthyOnly); // ['hello', 42, 'world', true]
 *
 * // TypeScript knows the result excludes falsy types
 * truthyOnly.forEach(item => {
 *   // No need for null/undefined checks here
 *   console.log(item.toString()); // Safe to call methods
 * });
 * ```
 *
 * @example
 * Form validation:
 * ```typescript
 * interface FormData {
 *   name?: string | null;
 *   email?: string | null;
 *   age?: number | null;
 *   terms?: boolean | null;
 * }
 *
 * function validateRequiredFields(formData: FormData) {
 *   const errors: string[] = [];
 *   
 *   if (!isTruthy(formData.name)) {
 *     errors.push('Name is required');
 *   }
 *   
 *   if (!isTruthy(formData.email)) {
 *     errors.push('Email is required');
 *   }
 *   
 *   if (!isTruthy(formData.age)) {
 *     errors.push('Age is required');
 *   }
 *   
 *   if (!isTruthy(formData.terms)) {
 *     errors.push('You must accept the terms');
 *   }
 *   
 *   return {
 *     isValid: errors.length === 0,
 *     errors
 *   };
 * }
 *
 * // Usage
 * const form1 = { name: 'John', email: '', age: 25, terms: true };
 * const validation1 = validateRequiredFields(form1);
 * console.log(validation1); // { isValid: false, errors: ['Email is required'] }
 * ```
 *
 * @example
 * Conditional rendering logic:
 * ```typescript
 * interface ComponentProps {
 *   title?: string | null;
 *   content?: string | null;
 *   showFooter?: boolean | null;
 *   items?: any[] | null;
 * }
 *
 * function renderComponent(props: ComponentProps): string {
 *   let html = '<div class="component">';
 *   
 *   if (isTruthy(props.title)) {
 *     // TypeScript knows title is not falsy
 *     html += `<h1>${props.title.trim()}</h1>`;
 *   }
 *   
 *   if (isTruthy(props.content)) {
 *     html += `<div class="content">${props.content}</div>`;
 *   }
 *   
 *   if (isTruthy(props.items)) {
 *     html += '<ul>';
 *     props.items.forEach(item => {
 *       html += `<li>${item}</li>`;
 *     });
 *     html += '</ul>';
 *   }
 *   
 *   if (isTruthy(props.showFooter)) {
 *     html += '<footer>Footer content</footer>';
 *   }
 *   
 *   html += '</div>';
 *   return html;
 * }
 * ```
 *
 * @example
 * Configuration processing:
 * ```typescript
 * interface Config {
 *   apiUrl?: string | null;
 *   timeout?: number | null;
 *   debug?: boolean | null;
 *   features?: string[] | null;
 * }
 *
 * function processConfig(userConfig: Config) {
 *   const defaultConfig = {
 *     apiUrl: 'https://api.example.com',
 *     timeout: 5000,
 *     debug: false,
 *     features: []
 *   };
 *   
 *   return {
 *     apiUrl: isTruthy(userConfig.apiUrl) ? userConfig.apiUrl : defaultConfig.apiUrl,
 *     timeout: isTruthy(userConfig.timeout) ? userConfig.timeout : defaultConfig.timeout,
 *     debug: isTruthy(userConfig.debug) ? userConfig.debug : defaultConfig.debug,
 *     features: isTruthy(userConfig.features) ? userConfig.features : defaultConfig.features
 *   };
 * }
 *
 * // Usage
 * const config = processConfig({
 *   apiUrl: 'https://custom-api.com',
 *   timeout: null, // Will use default
 *   debug: true,
 *   features: undefined // Will use default
 * });
 * ```
 *
 * @example
 * Object property cleaning:
 * ```typescript
 * function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
 *   const cleaned: Partial<T> = {};
 *   
 *   for (const [key, value] of Object.entries(obj)) {
 *     if (isTruthy(value)) {
 *       cleaned[key as keyof T] = value;
 *     }
 *   }
 *   
 *   return cleaned;
 * }
 *
 * // Usage
 * const data = {
 *   name: 'John',
 *   email: '',
 *   age: 0,
 *   active: true,
 *   notes: null,
 *   tags: ['important']
 * };
 *
 * const clean = cleanObject(data);
 * console.log(clean); // { name: 'John', active: true, tags: ['important'] }
 * ```
 *
 * @example
 * Search and filter utilities:
 * ```typescript
 * function searchResults<T>(
 *   items: T[],
 *   searchTerm?: string | null,
 *   filterFn?: ((item: T) => boolean) | null
 * ): T[] {
 *   let results = items;
 *   
 *   if (isTruthy(searchTerm)) {
 *     // TypeScript knows searchTerm is string (not null/undefined/empty)
 *     const term = searchTerm.toLowerCase();
 *     results = results.filter(item => 
 *       JSON.stringify(item).toLowerCase().includes(term)
 *     );
 *   }
 *   
 *   if (isTruthy(filterFn)) {
 *     // TypeScript knows filterFn is a function
 *     results = results.filter(filterFn);
 *   }
 *   
 *   return results;
 * }
 *
 * // Usage
 * const users = [
 *   { name: 'John', active: true },
 *   { name: 'Jane', active: false },
 *   { name: 'Bob', active: true }
 * ];
 *
 * const activeUsers = searchResults(
 *   users,
 *   'j', // Search for 'j'
 *   user => user.active // Filter for active users
 * );
 * console.log(activeUsers); // [{ name: 'John', active: true }]
 * ```
 *
 * @remarks
 * **Falsy Values in JavaScript:**
 * - `false` - boolean false
 * - `null` - null value
 * - `undefined` - undefined value
 * - `''` - empty string
 * - `0` - number zero
 * - `NaN` - Not a Number
 *
 * **Type Safety Benefits:**
 * - Excludes falsy types from the result type
 * - Enables safe method calls on filtered values
 * - Works as array filter predicate with proper type inference
 * - Provides compile-time guarantees about non-falsy values
 *
 * **Use Cases:**
 * - Array filtering to remove falsy values
 * - Form validation
 * - Conditional rendering logic
 * - Configuration processing
 * - Object property cleaning
 * - Default value assignment
 *
 * **Performance:** Double negation (`!!`) provides optimal performance for truthiness checking.
 *
 * **Related Functions:**
 * - Use `isNotNil()` to exclude only null and undefined
 * - Use `Boolean()` for explicit boolean conversion
 * - Use specific type checkers for precise validation
 * - Use `!!value` for direct truthy conversion
 */
export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => !!value;

/**
 * Union type representing all falsy values in JavaScript.
 * 
 * Includes all six falsy values:
 * - false (boolean false)
 * - null (null value)
 * - undefined (undefined value)
 * - '' (empty string)
 * - 0 (number zero)
 * - NaN (Not a Number) - Note: NaN is of type number but falsy
 */
export type Falsy = false | null | undefined | '' | 0 | typeof NaN;