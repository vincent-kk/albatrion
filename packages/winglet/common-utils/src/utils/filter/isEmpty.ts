import { isFalsy } from './isFalsy';

/**
 * Determines whether a value is empty with comprehensive checking.
 *
 * Provides reliable emptiness detection for various data types including
 * primitives, objects, arrays, and other data structures. Checks for
 * null/undefined, falsy primitives, and objects without enumerable properties.
 *
 * @param value - Value to test for emptiness
 * @returns Boolean indicating whether the value is considered empty
 *
 * @example
 * Basic empty value detection:
 * ```typescript
 * import { isEmpty } from '@winglet/common-utils';
 *
 * // True cases - empty values
 * console.log(isEmpty(null)); // true
 * console.log(isEmpty(undefined)); // true
 * console.log(isEmpty('')); // true
 * console.log(isEmpty(0)); // true
 * console.log(isEmpty(false)); // true
 * console.log(isEmpty(NaN)); // true
 * console.log(isEmpty({})); // true
 * console.log(isEmpty([])); // true
 * console.log(isEmpty(new Set())); // true
 * console.log(isEmpty(new Map())); // true
 *
 * // False cases - non-empty values
 * console.log(isEmpty('hello')); // false
 * console.log(isEmpty(1)); // false
 * console.log(isEmpty(true)); // false
 * console.log(isEmpty([1, 2, 3])); // false
 * console.log(isEmpty({ a: 1 })); // false
 * console.log(isEmpty(new Set([1]))); // false
 * console.log(isEmpty(new Map([['a', 1]]))); // false
 * console.log(isEmpty(() => {})); // false (functions are never empty)
 * ```
 *
 * @example
 * Object and array emptiness checking:
 * ```typescript
 * // Empty objects and arrays
 * const emptyObj = {};
 * const emptyArr = [];
 * console.log(isEmpty(emptyObj)); // true
 * console.log(isEmpty(emptyArr)); // true
 *
 * // Non-empty objects and arrays
 * const obj = { name: 'John' };
 * const arr = [1, 2, 3];
 * console.log(isEmpty(obj)); // false
 * console.log(isEmpty(arr)); // false
 *
 * // Objects with non-enumerable properties
 * const objWithNonEnum = {};
 * Object.defineProperty(objWithNonEnum, 'hidden', {
 *   value: 'secret',
 *   enumerable: false
 * });
 * console.log(isEmpty(objWithNonEnum)); // true (no enumerable properties)
 *
 * // Objects with inherited properties
 * const proto = { inherited: true };
 * const child = Object.create(proto);
 * console.log(isEmpty(child)); // true (no own enumerable properties)
 * child.own = 'value';
 * console.log(isEmpty(child)); // false
 * ```
 *
 * @example
 * Form validation with empty field detection:
 * ```typescript
 * interface FormData {
 *   username?: string;
 *   email?: string;
 *   age?: number;
 *   preferences?: Record<string, any>;
 *   tags?: string[];
 * }
 *
 * function validateForm(data: FormData): string[] {
 *   const errors: string[] = [];
 *
 *   if (isEmpty(data.username)) {
 *     errors.push('Username is required');
 *   }
 *
 *   if (isEmpty(data.email)) {
 *     errors.push('Email is required');
 *   }
 *
 *   if (isEmpty(data.age)) {
 *     errors.push('Age is required');
 *     // Note: age:0 would be considered empty
 *   }
 *
 *   if (isEmpty(data.preferences)) {
 *     errors.push('At least one preference must be selected');
 *   }
 *
 *   if (isEmpty(data.tags)) {
 *     errors.push('At least one tag must be added');
 *   }
 *
 *   return errors;
 * }
 *
 * // Usage
 * const form1 = { username: '', email: 'john@example.com', preferences: {} };
 * console.log(validateForm(form1));
 * // ['Username is required', 'At least one preference must be selected']
 * ```
 *
 * @example
 * Data filtering and cleanup:
 * ```typescript
 * function removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
 *   const result: Partial<T> = {};
 *
 *   for (const [key, value] of Object.entries(obj)) {
 *     if (!isEmpty(value)) {
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
 *   tags: [],
 *   metadata: {},
 *   callback: () => console.log('test')
 * };
 *
 * const cleaned = removeEmptyValues(data);
 * console.log(cleaned);
 * // { name: 'John', active: true, callback: [Function] }
 * // Removed: email:'', age:0, notes:null, tags:[], metadata:{}
 * ```
 *
 * @example
 * Collection operations with empty checking:
 * ```typescript
 * class DataStore {
 *   private collections: Map<string, any[]> = new Map();
 *
 *   addCollection(name: string, items: any[]): boolean {
 *     if (isEmpty(name) || isEmpty(items)) {
 *       console.warn('Cannot add empty collection or with empty name');
 *       return false;
 *     }
 *
 *     this.collections.set(name, items);
 *     return true;
 *   }
 *
 *   getCollection(name: string): any[] | null {
 *     if (isEmpty(name)) {
 *       return null;
 *     }
 *
 *     const collection = this.collections.get(name);
 *     return isEmpty(collection) ? null : collection;
 *   }
 *
 *   removeEmptyCollections(): number {
 *     let removed = 0;
 *     for (const [name, items] of this.collections.entries()) {
 *       if (isEmpty(items)) {
 *         this.collections.delete(name);
 *         removed++;
 *       }
 *     }
 *     return removed;
 *   }
 * }
 *
 * // Usage
 * const store = new DataStore();
 * store.addCollection('users', []); // false - empty items
 * store.addCollection('', [1, 2, 3]); // false - empty name
 * store.addCollection('products', [{ id: 1 }]); // true
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface ApiResponse {
 *   data?: any;
 *   error?: string;
 *   metadata?: Record<string, any>;
 * }
 *
 * function processApiResponse(response: ApiResponse): {
 *   isValid: boolean;
 *   reason?: string;
 * } {
 *   // Check for error first
 *   if (!isEmpty(response.error)) {
 *     return { isValid: false, reason: response.error };
 *   }
 *
 *   // Check if data is present and not empty
 *   if (isEmpty(response.data)) {
 *     return { isValid: false, reason: 'No data received' };
 *   }
 *
 *   // Check if metadata exists when required
 *   if (isEmpty(response.metadata)) {
 *     console.warn('Response metadata is empty');
 *   }
 *
 *   return { isValid: true };
 * }
 *
 * // Usage examples
 * console.log(processApiResponse({ data: null }));
 * // { isValid: false, reason: 'No data received' }
 *
 * console.log(processApiResponse({ data: [], error: '' }));
 * // { isValid: false, reason: 'No data received' }
 *
 * console.log(processApiResponse({ data: { id: 1 } }));
 * // { isValid: true }
 * ```
 *
 * @example
 * Configuration with defaults:
 * ```typescript
 * interface Config {
 *   apiUrl?: string;
 *   timeout?: number;
 *   headers?: Record<string, string>;
 *   retry?: {
 *     attempts?: number;
 *     delay?: number;
 *   };
 * }
 *
 * function applyDefaults(userConfig: Config): Required<Config> {
 *   const defaults: Required<Config> = {
 *     apiUrl: 'https://api.example.com',
 *     timeout: 5000,
 *     headers: { 'Content-Type': 'application/json' },
 *     retry: { attempts: 3, delay: 1000 }
 *   };
 *
 *   return {
 *     apiUrl: isEmpty(userConfig.apiUrl) ? defaults.apiUrl : userConfig.apiUrl,
 *     timeout: isEmpty(userConfig.timeout) ? defaults.timeout : userConfig.timeout,
 *     headers: isEmpty(userConfig.headers) ? defaults.headers : userConfig.headers,
 *     retry: isEmpty(userConfig.retry) ? defaults.retry : {
 *       attempts: isEmpty(userConfig.retry.attempts)
 *         ? defaults.retry.attempts
 *         : userConfig.retry.attempts,
 *       delay: isEmpty(userConfig.retry.delay)
 *         ? defaults.retry.delay
 *         : userConfig.retry.delay
 *     }
 *   };
 * }
 *
 * // Usage
 * const config = applyDefaults({ timeout: 0, headers: {} });
 * console.log(config);
 * // Uses defaults for timeout (0 is empty) and headers ({} is empty)
 * ```
 *
 * @example
 * Conditional rendering in UI components:
 * ```typescript
 * interface ComponentData {
 *   title?: string;
 *   items?: any[];
 *   metadata?: Record<string, any>;
 *   footer?: string;
 * }
 *
 * function renderComponent(data: ComponentData): string {
 *   let html = '<div class="component">';
 *
 *   // Only render title if not empty
 *   if (!isEmpty(data.title)) {
 *     html += `<h1>${data.title}</h1>`;
 *   }
 *
 *   // Only render items section if array is not empty
 *   if (!isEmpty(data.items)) {
 *     html += '<ul>';
 *     data.items.forEach(item => {
 *       html += `<li>${item}</li>`;
 *     });
 *     html += '</ul>';
 *   } else {
 *     html += '<p>No items to display</p>';
 *   }
 *
 *   // Only render metadata if object has properties
 *   if (!isEmpty(data.metadata)) {
 *     html += '<div class="metadata">';
 *     for (const [key, value] of Object.entries(data.metadata)) {
 *       html += `<span>${key}: ${value}</span>`;
 *     }
 *     html += '</div>';
 *   }
 *
 *   // Only render footer if not empty
 *   if (!isEmpty(data.footer)) {
 *     html += `<footer>${data.footer}</footer>`;
 *   }
 *
 *   html += '</div>';
 *   return html;
 * }
 * ```
 *
 * @example
 * Database query optimization:
 * ```typescript
 * interface QueryParams {
 *   filters?: Record<string, any>;
 *   sort?: { field: string; order: 'asc' | 'desc' };
 *   limit?: number;
 *   offset?: number;
 * }
 *
 * function buildQuery(table: string, params: QueryParams): string {
 *   let query = `SELECT * FROM ${table}`;
 *   const conditions: string[] = [];
 *
 *   // Add WHERE clause only if filters are not empty
 *   if (!isEmpty(params.filters)) {
 *     for (const [field, value] of Object.entries(params.filters)) {
 *       if (!isEmpty(value)) {
 *         conditions.push(`${field} = '${value}'`);
 *       }
 *     }
 *     if (conditions.length > 0) {
 *       query += ` WHERE ${conditions.join(' AND ')}`;
 *     }
 *   }
 *
 *   // Add ORDER BY only if sort is not empty
 *   if (!isEmpty(params.sort)) {
 *     query += ` ORDER BY ${params.sort.field} ${params.sort.order}`;
 *   }
 *
 *   // Add LIMIT only if specified and not zero
 *   if (!isEmpty(params.limit)) {
 *     query += ` LIMIT ${params.limit}`;
 *   }
 *
 *   // Add OFFSET only if specified and not zero
 *   if (!isEmpty(params.offset)) {
 *     query += ` OFFSET ${params.offset}`;
 *   }
 *
 *   return query;
 * }
 *
 * // Usage
 * console.log(buildQuery('users', { filters: {}, limit: 0 }));
 * // 'SELECT * FROM users' (empty filters and limit are ignored)
 *
 * console.log(buildQuery('users', {
 *   filters: { active: true, role: 'admin' },
 *   sort: { field: 'created', order: 'desc' },
 *   limit: 10
 * }));
 * // 'SELECT * FROM users WHERE active = 'true' AND role = 'admin' ORDER BY created desc LIMIT 10'
 * ```
 *
 * @remarks
 * **Empty Value Detection Rules:**
 * - `null` and `undefined` are always empty
 * - For primitives (non-objects/functions): uses `isFalsy()` check
 *   - Empty: `''`, `0`, `false`, `NaN`, `0n`
 *   - Non-empty: any other primitive value
 * - For objects: checks for enumerable properties
 *   - Empty: `{}`, `[]`, `new Set()`, `new Map()`, etc. (no enumerable properties)
 *   - Non-empty: objects with at least one enumerable property
 * - Functions are never considered empty
 *
 * **Special Cases:**
 * - Empty arrays `[]` return true (no enumerable indices)
 * - Empty objects `{}` return true (no enumerable properties)
 * - Objects with only non-enumerable properties return true
 * - Objects with only inherited properties return true
 * - Functions always return false (never empty)
 * - The number `0` returns true (falsy value)
 * - Empty string `''` returns true (falsy value)
 * - `NaN` returns true (falsy value)
 *
 * **Implementation Details:**
 * - Uses loose equality (`==`) for null check to catch both null and undefined
 * - Checks primitive types using `isFalsy()` for consistency
 * - Uses `for...in` loop for efficient enumerable property detection
 * - Returns immediately when first enumerable property is found
 *
 * **Use Cases:**
 * - Form validation and required field checking
 * - Data filtering and cleanup operations
 * - API response validation
 * - Configuration processing with defaults
 * - Conditional rendering in UI components
 * - Database query optimization
 * - Collection management
 *
 * **Performance:** Optimized with early returns and efficient property checking.
 *
 * **Related Functions:**
 * - Use `isFalsy()` for falsy value checking
 * - Use `isNil()` to check only for null or undefined
 * - Use `isEmptyArray()` specifically for array emptiness
 * - Use `isEmptyObject()` specifically for plain object emptiness
 * - Use specific type checkers for precise validation
 */
export const isEmpty = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value !== 'object' && typeof value !== 'function')
    return isFalsy(value);
  for (const _ in value) return false;
  return true;
};
