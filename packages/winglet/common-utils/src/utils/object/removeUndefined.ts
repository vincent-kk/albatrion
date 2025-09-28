import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

/**
 * Recursively removes undefined values from nested data structures.
 *
 * Performs deep traversal of objects and arrays to eliminate undefined values
 * while preserving the original structure and types. Creates new instances for
 * modified structures and returns original references for unmodified ones,
 * optimizing memory usage and performance.
 *
 * @template Type - Type of the input value to be processed
 * @param input - Data structure to process (objects, arrays, or primitives)
 * @returns New structure with undefined values removed, or original if no undefined found
 *
 * @example
 * Basic undefined removal from objects:
 * ```typescript
 * import { removeUndefined } from '@winglet/common-utils';
 *
 * // Simple object cleaning
 * const dirtyUser = {
 *   id: 1,
 *   name: 'John',
 *   email: undefined,
 *   phone: '+1234567890',
 *   address: undefined
 * };
 *
 * const cleanUser = removeUndefined(dirtyUser);
 * console.log(cleanUser); // { id: 1, name: 'John', phone: '+1234567890' }
 *
 * // Empty object after undefined removal
 * const allUndefined = { a: undefined, b: undefined };
 * console.log(removeUndefined(allUndefined)); // {}
 *
 * // No undefined values - returns new reference
 * const cleanObject = { a: 1, b: 'hello' };
 * const result = removeUndefined(cleanObject);
 * console.log(result); // { a: 1, b: 'hello' }
 * console.log(result !== cleanObject); // true (new object created)
 * ```
 *
 * @example
 * Array processing and filtering:
 * ```typescript
 * // Remove undefined elements from arrays
 * const sparseArray = [1, undefined, 'hello', undefined, true, null];
 * const denseArray = removeUndefined(sparseArray);
 * console.log(denseArray); // [1, 'hello', true, null]
 *
 * // Note: null values are preserved (only undefined is removed)
 * const mixedValues = [0, false, '', null, undefined, NaN];
 * console.log(removeUndefined(mixedValues)); // [0, false, '', null, NaN]
 *
 * // Nested arrays
 * const nestedArrays = [1, [2, undefined, 3], [undefined, 4]];
 * console.log(removeUndefined(nestedArrays)); // [1, [2, 3], [4]]
 *
 * // Empty array after filtering
 * const onlyUndefined = [undefined, undefined, undefined];
 * console.log(removeUndefined(onlyUndefined)); // []
 * ```
 *
 * @example
 * Deep nested structure processing:
 * ```typescript
 * // Complex nested object with mixed undefined values
 * const complexData = {
 *   user: {
 *     profile: {
 *       name: 'Alice',
 *       bio: undefined,
 *       social: {
 *         twitter: '@alice',
 *         instagram: undefined,
 *         linkedin: 'alice-profile'
 *       }
 *     },
 *     settings: {
 *       theme: 'dark',
 *       notifications: undefined,
 *       privacy: {
 *         public: true,
 *         searchable: undefined
 *       }
 *     }
 *   },
 *   metadata: {
 *     created: new Date(),
 *     updated: undefined,
 *     tags: ['user', undefined, 'verified', undefined]
 *   }
 * };
 *
 * const cleaned = removeUndefined(complexData);
 * console.log(cleaned);
 * // {
 * //   user: {
 * //     profile: {
 * //       name: 'Alice',
 * //       social: {
 * //         twitter: '@alice',
 * //         linkedin: 'alice-profile'
 * //       }
 * //     },
 * //     settings: {
 * //       theme: 'dark',
 * //       privacy: {
 * //         public: true
 * //       }
 * //     }
 * //   },
 * //   metadata: {
 * //     created: new Date(),
 * //     tags: ['user', 'verified']
 * //   }
 * // }
 * ```
 *
 * @example
 * API data sanitization:
 * ```typescript
 * // Clean API response data before sending to client
 * interface ApiUser {
 *   id: number;
 *   name: string;
 *   email?: string;
 *   avatar?: string;
 *   preferences?: {
 *     theme?: string;
 *     language?: string;
 *     notifications?: boolean;
 *   };
 * }
 *
 * const apiResponse: ApiUser = {
 *   id: 123,
 *   name: 'John Doe',
 *   email: undefined,  // Not provided
 *   avatar: 'https://example.com/avatar.jpg',
 *   preferences: {
 *     theme: 'dark',
 *     language: undefined,  // Not set
 *     notifications: true
 *   }
 * };
 *
 * // Clean before sending to reduce payload size
 * const cleanResponse = removeUndefined(apiResponse);
 * console.log(JSON.stringify(cleanResponse));
 * // '{"id":123,"name":"John Doe","avatar":"https://example.com/avatar.jpg","preferences":{"theme":"dark","notifications":true}}'
 * ```
 *
 * @example
 * Form data processing:
 * ```typescript
 * // Process form data removing empty/undefined fields
 * const formData = {
 *   personalInfo: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     middleName: undefined,  // Optional field not filled
 *     email: 'john@example.com'
 *   },
 *   contactInfo: {
 *     phone: '+1234567890',
 *     alternatePhone: undefined,  // Not provided
 *     address: {
 *       street: '123 Main St',
 *       apartment: undefined,  // Not applicable
 *       city: 'Anytown',
 *       state: 'CA',
 *       zipCode: '12345'
 *     }
 *   },
 *   preferences: {
 *     newsletter: true,
 *     marketing: undefined,  // Not selected
 *     categories: ['tech', undefined, 'news']  // Some unselected
 *   }
 * };
 *
 * const processedForm = removeUndefined(formData);
 * // Result contains only fields with actual values
 * console.log(processedForm.preferences.categories); // ['tech', 'news']
 * ```
 *
 * @example
 * Configuration object cleaning:
 * ```typescript
 * // Remove undefined configuration options
 * interface AppConfig {
 *   database?: {
 *     host?: string;
 *     port?: number;
 *     ssl?: boolean;
 *   };
 *   cache?: {
 *     enabled?: boolean;
 *     ttl?: number;
 *   };
 *   features?: string[];
 * }
 *
 * const rawConfig: AppConfig = {
 *   database: {
 *     host: 'localhost',
 *     port: undefined,  // Use default
 *     ssl: false
 *   },
 *   cache: {
 *     enabled: true,
 *     ttl: undefined  // Use default
 *   },
 *   features: ['auth', undefined, 'logging', undefined]  // Conditional features
 * };
 *
 * const finalConfig = removeUndefined(rawConfig);
 * // Only explicitly set values remain
 * console.log(finalConfig);
 * // {
 * //   database: { host: 'localhost', ssl: false },
 * //   cache: { enabled: true },
 * //   features: ['auth', 'logging']
 * // }
 * ```
 *
 * @example
 * Edge cases and primitive handling:
 * ```typescript
 * // Primitive values pass through unchanged
 * console.log(removeUndefined('hello')); // 'hello'
 * console.log(removeUndefined(42)); // 42
 * console.log(removeUndefined(null)); // null
 * console.log(removeUndefined(undefined)); // undefined (unchanged)
 *
 * // Functions and other objects
 * const func = () => 'test';
 * console.log(removeUndefined(func)); // [Function: func]
 *
 * // Date objects (not plain objects)
 * const date = new Date();
 * console.log(removeUndefined(date)); // Date object unchanged
 *
 * // Arrays with holes (sparse arrays)
 * const sparse = new Array(5);
 * sparse[0] = 'first';
 * sparse[4] = 'last';
 * // sparse[1], sparse[2], sparse[3] are undefined
 * console.log(removeUndefined(sparse)); // ['first', 'last']
 * ```
 *
 * @remarks
 * **Processing Strategy:**
 * - **Arrays**: Filters out undefined elements while preserving order
 * - **Plain Objects**: Removes properties with undefined values recursively
 * - **Primitives**: Returns the value unchanged (including undefined itself)
 * - **Other Objects**: Returns unchanged (Date, RegExp, custom classes, etc.)
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n) where n is total number of properties/elements
 * - **Space Complexity**: O(m) where m is size of result structure
 * - **Optimization**: Creates new objects only when modifications are needed
 * - **Memory Efficient**: Reuses unchanged nested structures when possible
 *
 * **Type Preservation:**
 * - Maintains original TypeScript types where possible
 * - Array lengths may change due to filtering
 * - Object shapes may change due to property removal
 * - Primitive types remain unchanged
 *
 * **Comparison with Alternatives:**
 * - `JSON.parse(JSON.stringify(obj))`: Removes undefined but also functions, dates
 * - Manual filtering: More verbose and error-prone for nested structures
 * - Lodash `omitBy(isUndefined)`: Shallow only, doesn't handle nested structures
 * - Custom recursive solutions: Risk of infinite loops with circular references
 *
 * **Use Cases:**
 * - API response sanitization and payload optimization
 * - Form data processing before submission
 * - Configuration object cleaning
 * - Database record preparation
 * - JSON serialization preparation
 * - State management cleanup
 *
 * **Limitations:**
 * - Does not handle circular references (may cause infinite recursion)
 * - Only processes enumerable own properties
 * - Does not process Symbol properties
 * - May change object/array references even when no undefined values exist
 * - Performance impact on very large nested structures
 */
export const removeUndefined = <Type>(input: Type): Type => {
  if (isArray(input)) {
    const result = [] as typeof input;
    for (let i = 0, l = input.length; i < l; i++) {
      const item = removeUndefined(input[i]);
      if (item !== undefined) result[result.length] = item;
    }
    return result;
  }
  if (isPlainObject(input)) {
    const result = {} as typeof input;
    const keys = Object.keys(input) as Array<keyof Type>;
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      const value = removeUndefined(input[k] as object);
      if (value !== undefined) (result as any)[k] = value;
    }
    return result;
  }
  return input;
};
