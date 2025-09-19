/**
 * Determines whether a value is falsy with enhanced type safety.
 *
 * Provides reliable falsy value detection using logical NOT operator,
 * checking if the value is one of the falsy values in JavaScript
 * (false, null, undefined, '', 0, 0n, NaN) and providing TypeScript type
 * narrowing to identify falsy types.
 *
 * @template T - The input type
 * @param value - Value to test for falsy characteristics
 * @returns Type-safe boolean indicating whether the value is falsy
 *
 * @example
 * Basic falsy detection:
 * ```typescript
 * import { isFalsy } from '@winglet/common-utils';
 *
 * // True cases - falsy values
 * console.log(isFalsy(false)); // true
 * console.log(isFalsy(null)); // true
 * console.log(isFalsy(undefined)); // true
 * console.log(isFalsy('')); // true (empty string)
 * console.log(isFalsy(0)); // true (zero)
 * console.log(isFalsy(0n)); // true (BigInt zero)
 * console.log(isFalsy(NaN)); // true
 *
 * // False cases - truthy values
 * console.log(isFalsy('hello')); // false (non-empty string)
 * console.log(isFalsy('0')); // false (string containing '0')
 * console.log(isFalsy(1)); // false (positive number)
 * console.log(isFalsy(-1)); // false (negative number)
 * console.log(isFalsy(1n)); // false (non-zero BigInt)
 * console.log(isFalsy(true)); // false (boolean true)
 * console.log(isFalsy({})); // false (object)
 * console.log(isFalsy([])); // false (array)
 * console.log(isFalsy(new Date())); // false (Date object)
 * console.log(isFalsy(() => {})); // false (function)
 * console.log(isFalsy(Infinity)); // false (Infinity)
 * console.log(isFalsy(Symbol('test'))); // false (symbol)
 * ```
 *
 * @example
 * Array filtering to extract falsy values:
 * ```typescript
 * function filterFalsyValues<T>(array: T[]): Array<T & Falsy> {
 *   return array.filter(isFalsy);
 * }
 *
 * // Usage
 * const mixed = ['hello', '', 0, 42, null, 'world', undefined, false, true];
 * const falsyOnly = filterFalsyValues(mixed);
 * console.log(falsyOnly); // ['', 0, null, undefined, false]
 *
 * // TypeScript knows the result contains only falsy types
 * falsyOnly.forEach(item => {
 *   // item is known to be falsy
 *   console.log(`Falsy value: ${item}`);
 * });
 * ```
 *
 * @example
 * Input validation and error detection:
 * ```typescript
 * interface UserInput {
 *   username?: string | null;
 *   password?: string | null;
 *   age?: number | null;
 *   isActive?: boolean | null;
 * }
 *
 * function findMissingFields(input: UserInput): string[] {
 *   const missing: string[] = [];
 *
 *   if (isFalsy(input.username)) {
 *     missing.push('username');
 *   }
 *
 *   if (isFalsy(input.password)) {
 *     missing.push('password');
 *   }
 *
 *   // Note: age 0 would be considered falsy
 *   if (isFalsy(input.age)) {
 *     missing.push('age');
 *   }
 *
 *   // Note: false for isActive would be considered falsy
 *   if (isFalsy(input.isActive)) {
 *     missing.push('isActive');
 *   }
 *
 *   return missing;
 * }
 *
 * // Usage
 * const input1 = { username: 'john', password: '', age: 25, isActive: true };
 * const missing1 = findMissingFields(input1);
 * console.log(missing1); // ['password'] - empty string is falsy
 *
 * const input2 = { username: null, password: 'secret', age: 0, isActive: false };
 * const missing2 = findMissingFields(input2);
 * console.log(missing2); // ['username', 'age', 'isActive']
 * ```
 *
 * @example
 * Default value assignment with falsy checking:
 * ```typescript
 * interface Options {
 *   retries?: number | null;
 *   timeout?: number | null;
 *   verbose?: boolean | null;
 *   endpoint?: string | null;
 * }
 *
 * function configureOptions(userOptions: Options) {
 *   // Only use defaults for truly missing values
 *   // Note: 0 and false would trigger defaults
 *   const config = {
 *     retries: isFalsy(userOptions.retries) ? 3 : userOptions.retries,
 *     timeout: isFalsy(userOptions.timeout) ? 5000 : userOptions.timeout,
 *     verbose: isFalsy(userOptions.verbose) ? false : userOptions.verbose,
 *     endpoint: isFalsy(userOptions.endpoint) ? 'https://api.example.com' : userOptions.endpoint
 *   };
 *
 *   return config;
 * }
 *
 * // Usage
 * const options1 = configureOptions({ retries: 0, timeout: null });
 * console.log(options1); // { retries: 3, timeout: 5000, ... }
 * // Note: retries:0 is falsy, so default is used
 *
 * const options2 = configureOptions({ retries: 1, verbose: true });
 * console.log(options2); // { retries: 1, timeout: 5000, verbose: true, ... }
 * ```
 *
 * @example
 * Object property removal:
 * ```typescript
 * function removeFalsyProperties<T extends Record<string, any>>(obj: T): Partial<T> {
 *   const result: Partial<T> = {};
 *
 *   for (const [key, value] of Object.entries(obj)) {
 *     if (!isFalsy(value)) {
 *       result[key as keyof T] = value;
 *     }
 *   }
 *
 *   return result;
 * }
 *
 * // Usage
 * const data = {
 *   name: 'John',
 *   email: '',
 *   age: 0,
 *   active: true,
 *   notes: null,
 *   tags: ['important'],
 *   score: NaN,
 *   verified: false
 * };
 *
 * const cleaned = removeFalsyProperties(data);
 * console.log(cleaned); // { name: 'John', active: true, tags: ['important'] }
 * // Removed: email:'', age:0, notes:null, score:NaN, verified:false
 * ```
 *
 * @example
 * Conditional rendering checks:
 * ```typescript
 * interface DisplayData {
 *   title?: string | null;
 *   count?: number | null;
 *   isEnabled?: boolean | null;
 *   items?: any[] | null;
 * }
 *
 * function shouldHideSection(data: DisplayData): boolean {
 *   // Hide if all values are falsy
 *   return (
 *     isFalsy(data.title) &&
 *     isFalsy(data.count) &&
 *     isFalsy(data.isEnabled) &&
 *     isFalsy(data.items)
 *   );
 * }
 *
 * // Usage
 * const emptySection = { title: '', count: 0, isEnabled: false, items: null };
 * console.log(shouldHideSection(emptySection)); // true - all falsy
 *
 * const partialSection = { title: 'Section', count: 0, isEnabled: false, items: [] };
 * console.log(shouldHideSection(partialSection)); // false - has truthy values
 * ```
 *
 * @example
 * Logging and debugging utilities:
 * ```typescript
 * function debugLog<T>(value: T, label: string): void {
 *   if (isFalsy(value)) {
 *     console.warn(`[${label}] Value is falsy:`, value);
 *     // Additional debugging for falsy values
 *     if (value === null) {
 *       console.warn(`  - Type: null`);
 *     } else if (value === undefined) {
 *       console.warn(`  - Type: undefined`);
 *     } else if (value === '') {
 *       console.warn(`  - Type: empty string`);
 *     } else if (value === 0) {
 *       console.warn(`  - Type: zero`);
 *     } else if (value === false) {
 *       console.warn(`  - Type: false`);
 *     } else if (Number.isNaN(value as any)) {
 *       console.warn(`  - Type: NaN`);
 *     }
 *   } else {
 *     console.log(`[${label}] Value is truthy:`, value);
 *   }
 * }
 *
 * // Usage
 * debugLog('', 'username'); // Warns: Value is falsy, Type: empty string
 * debugLog(0, 'count'); // Warns: Value is falsy, Type: zero
 * debugLog('hello', 'greeting'); // Logs: Value is truthy
 * ```
 *
 * @example
 * Data transformation pipeline:
 * ```typescript
 * function processDataPipeline<T>(data: T[]): {
 *   valid: Array<Exclude<T, Falsy>>,
 *   invalid: Array<T & Falsy>
 * } {
 *   const valid: Array<Exclude<T, Falsy>> = [];
 *   const invalid: Array<T & Falsy> = [];
 *
 *   data.forEach(item => {
 *     if (isFalsy(item)) {
 *       invalid.push(item);
 *     } else {
 *       valid.push(item as Exclude<T, Falsy>);
 *     }
 *   });
 *
 *   return { valid, invalid };
 * }
 *
 * // Usage
 * const mixedData = [1, 0, 'text', '', true, false, null, undefined, NaN, {}, []];
 * const { valid, invalid } = processDataPipeline(mixedData);
 * console.log('Valid:', valid); // [1, 'text', true, {}, []]
 * console.log('Invalid:', invalid); // [0, '', false, null, undefined, NaN]
 * ```
 *
 * @remarks
 * **The Falsy Values in JavaScript:**
 * - `false` - The boolean false value
 * - `null` - Represents intentional absence of value
 * - `undefined` - Variable declared but not assigned
 * - `''` (empty string) - String with zero length
 * - `0` - The number zero (including -0 and +0)
 * - `0n` - BigInt zero value
 * - `NaN` - "Not a Number" value
 *
 * **Type Safety Benefits:**
 * - Narrows type to intersection with Falsy union type
 * - Enables TypeScript to understand value characteristics
 * - Works as array filter predicate with proper type inference
 * - Provides compile-time information about falsy values
 *
 * **Common Pitfalls:**
 * - Empty arrays `[]` and objects `{}` are NOT falsy (they are truthy)
 * - The string `"0"` is NOT falsy (it's a non-empty string)
 * - Negative numbers like `-1` are NOT falsy (only 0 is falsy)
 * - The string `"false"` is NOT falsy (it's a non-empty string)
 *
 * **Use Cases:**
 * - Identifying missing or invalid values
 * - Input validation where falsy means "not provided"
 * - Data cleaning and sanitization
 * - Conditional logic based on value absence
 * - Default value assignment logic
 * - Debugging and logging utilities
 *
 * **Performance:** Single logical NOT (`!`) provides optimal performance for falsy checking.
 *
 * **Related Functions:**
 * - Use `isTruthy()` for the opposite check
 * - Use `isNil()` to check only for null or undefined
 * - Use specific type checkers for precise validation
 * - Use `!value` for direct falsy conversion without type narrowing
 */
export const isFalsy = <T>(value: T): value is Extract<T, Falsy> => !value;

/**
 * Union type representing all falsy values in JavaScript.
 *
 * Includes all falsy values:
 * - false (boolean false)
 * - null (null value)
 * - undefined (undefined value)
 * - '' (empty string)
 * - 0 (number zero, including -0 and +0)
 * - 0n (BigInt zero)
 * - NaN (Not a Number) - Note: NaN is of type number but falsy
 */
export type Falsy = false | null | undefined | '' | 0 | 0n | typeof NaN;
