/**
 * Transforms object values while preserving keys and structure.
 *
 * Creates a new object by applying a transformation function to each value while
 * keeping all keys unchanged. Enables value normalization, type conversion,
 * and data processing while maintaining object shape and property relationships.
 * Provides full access to value, key, and parent object context.
 *
 * @template Type - Input object type
 * @template Key - Object key type (inferred from Type)
 * @template Value - Output value type after transformation
 * @param object - Object whose values will be transformed
 * @param getValue - Function that transforms each value, receives (value, key, object)
 * @returns New object with original keys and transformed values
 *
 * @example
 * Basic value transformation:
 * ```typescript
 * import { transformValues } from '@winglet/common-utils';
 *
 * // Double all numeric values
 * const numbers = { a: 1, b: 2, c: 3 };
 * const doubled = transformValues(numbers, (value) => value * 2);
 * console.log(doubled); // { a: 2, b: 4, c: 6 }
 *
 * // Convert strings to uppercase
 * const strings = { name: 'john', city: 'nyc', country: 'usa' };
 * const uppercase = transformValues(strings, (value) => value.toUpperCase());
 * console.log(uppercase); // { name: 'JOHN', city: 'NYC', country: 'USA' }
 * ```
 *
 * @example
 * Type conversion and normalization:
 * ```typescript
 * // Convert all values to strings
 * const mixed = { id: 123, active: true, score: 95.5, name: 'Alice' };
 * const stringified = transformValues(mixed, (value) => String(value));
 * console.log(stringified); // { id: '123', active: 'true', score: '95.5', name: 'Alice' }
 *
 * // Normalize boolean-like values
 * const booleanLike = { enabled: 'true', visible: 1, active: 'yes', disabled: 0 };
 * const normalized = transformValues(booleanLike, (value) => {
 *   if (value === 'true' || value === 1 || value === 'yes') return true;
 *   if (value === 'false' || value === 0 || value === 'no') return false;
 *   return Boolean(value);
 * });
 * console.log(normalized); // { enabled: true, visible: true, active: true, disabled: false }
 * ```
 *
 * @example
 * Key-dependent value transformation:
 * ```typescript
 * // Transform values based on their keys
 * const userForm = {
 *   firstName: '  alice  ',
 *   lastName: '  SMITH  ',
 *   email: '  Alice.Smith@EXAMPLE.COM  ',
 *   age: '25',
 *   phone: '+1-234-567-8900'
 * };
 *
 * const processed = transformValues(userForm, (value, key) => {
 *   const trimmed = value.trim();
 *
 *   switch (key) {
 *     case 'firstName':
 *     case 'lastName':
 *       return trimmed.toLowerCase().replace(/^\w/, c => c.toUpperCase());
 *     case 'email':
 *       return trimmed.toLowerCase();
 *     case 'age':
 *       return parseInt(trimmed, 10);
 *     case 'phone':
 *       return trimmed.replace(/[^\d]/g, '');
 *     default:
 *       return trimmed;
 *   }
 * });
 *
 * console.log(processed);
 * // {
 * //   firstName: 'Alice',
 * //   lastName: 'Smith',
 * //   email: 'alice.smith@example.com',
 * //   age: 25,
 * //   phone: '12345678900'
 * // }
 * ```
 *
 * @example
 * Context-aware transformation:
 * ```typescript
 * // Transform values using the entire object context
 * const product = {
 *   name: 'Laptop',
 *   price: 999.99,
 *   discount: 0.1,
 *   tax: 0.08,
 *   category: 'electronics'
 * };
 *
 * const calculated = transformValues(product, (value, key, obj) => {
 *   switch (key) {
 *     case 'price':
 *       // Apply discount
 *       return value * (1 - obj.discount);
 *     case 'tax':
 *       // Calculate tax on discounted price
 *       const discountedPrice = obj.price * (1 - obj.discount);
 *       return discountedPrice * obj.tax;
 *     case 'discount':
 *       // Convert to percentage string
 *       return `${(value * 100).toFixed(0)}%`;
 *     default:
 *       return value;
 *   }
 * });
 *
 * console.log(calculated);
 * // {
 * //   name: 'Laptop',
 * //   price: 899.991,        // After 10% discount
 * //   discount: '10%',       // Formatted percentage
 * //   tax: 71.999,          // Tax on discounted price
 * //   category: 'electronics'
 * // }
 * ```
 *
 * @example
 * Data sanitization and validation:
 * ```typescript
 * // Sanitize and validate user input
 * const userInput = {
 *   username: 'John_Doe123',
 *   password: 'weakpass',
 *   confirmPassword: 'weakpass',
 *   email: 'JOHN@EXAMPLE.COM',
 *   website: 'example.com'
 * };
 *
 * const sanitized = transformValues(userInput, (value, key) => {
 *   switch (key) {
 *     case 'username':
 *       // Remove special characters, lowercase
 *       return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
 *     case 'email':
 *       return value.toLowerCase().trim();
 *     case 'website':
 *       // Ensure protocol
 *       return value.startsWith('http') ? value : `https://${value}`;
 *     case 'password':
 *     case 'confirmPassword':
 *       // Hash or validate (simplified example)
 *       return value.length >= 8 ? `[VALID:${value.length}]` : `[WEAK:${value.length}]`;
 *     default:
 *       return value;
 *   }
 * });
 *
 * console.log(sanitized);
 * // {
 * //   username: 'johndoe123',
 * //   password: '[WEAK:8]',
 * //   confirmPassword: '[WEAK:8]',
 * //   email: 'john@example.com',
 * //   website: 'https://example.com'
 * // }
 * ```
 *
 * @example
 * API response processing:
 * ```typescript
 * // Process API response data
 * const apiResponse = {
 *   id: '123',
 *   created_at: '2023-01-01T12:00:00Z',
 *   updated_at: '2023-01-02T15:30:00Z',
 *   price: '29.99',
 *   status: 'ACTIVE',
 *   tags: 'web,mobile,api',
 *   metadata: '{"priority": "high", "owner": "team-alpha"}'
 * };
 *
 * const processed = transformValues(apiResponse, (value, key) => {
 *   switch (key) {
 *     case 'id':
 *       return parseInt(value, 10);
 *     case 'created_at':
 *     case 'updated_at':
 *       return new Date(value);
 *     case 'price':
 *       return parseFloat(value);
 *     case 'status':
 *       return value.toLowerCase();
 *     case 'tags':
 *       return value.split(',').map(tag => tag.trim());
 *     case 'metadata':
 *       try {
 *         return JSON.parse(value);
 *       } catch {
 *         return {};
 *       }
 *     default:
 *       return value;
 *   }
 * });
 *
 * console.log(processed);
 * // {
 * //   id: 123,
 * //   created_at: Date object,
 * //   updated_at: Date object,
 * //   price: 29.99,
 * //   status: 'active',
 * //   tags: ['web', 'mobile', 'api'],
 * //   metadata: { priority: 'high', owner: 'team-alpha' }
 * // }
 * ```
 *
 * @example
 * Configuration processing:
 * ```typescript
 * // Process environment configuration
 * const envConfig = {
 *   PORT: '3000',
 *   DEBUG: 'true',
 *   DATABASE_URL: 'postgres://localhost:5432/mydb',
 *   REDIS_TTL: '3600',
 *   ALLOWED_ORIGINS: 'localhost:3000,example.com',
 *   LOG_LEVEL: 'INFO'
 * };
 *
 * const config = transformValues(envConfig, (value, key) => {
 *   switch (key) {
 *     case 'PORT':
 *     case 'REDIS_TTL':
 *       return parseInt(value, 10);
 *     case 'DEBUG':
 *       return value.toLowerCase() === 'true';
 *     case 'ALLOWED_ORIGINS':
 *       return value.split(',').map(origin => origin.trim());
 *     case 'LOG_LEVEL':
 *       return value.toLowerCase();
 *     default:
 *       return value;
 *   }
 * });
 *
 * console.log(config);
 * // {
 * //   PORT: 3000,
 * //   DEBUG: true,
 * //   DATABASE_URL: 'postgres://localhost:5432/mydb',
 * //   REDIS_TTL: 3600,
 * //   ALLOWED_ORIGINS: ['localhost:3000', 'example.com'],
 * //   LOG_LEVEL: 'info'
 * // }
 * ```
 *
 * @remarks
 * **Transformation Process:**
 * - Iterates through all enumerable own properties using Object.keys()
 * - Calls transformation function for each property with (value, key, object)
 * - Creates new object with original keys and transformed values
 * - Maintains property enumeration order
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n) where n is number of properties
 * - **Space Complexity**: O(n) for the new object
 * - **Memory**: Creates entirely new object, doesn't modify original
 *
 * **Type Safety:**
 * - Input object structure is preserved for context access
 * - Output value type is inferred from transformation function return
 * - Keys maintain their original types and names
 * - Provides full TypeScript support with generics
 *
 * **Context Access:**
 * - **value**: Current property value being transformed
 * - **key**: Property key (typed as keyof input object)
 * - **object**: Reference to the entire input object for context
 *
 * **Use Cases:**
 * - Data type conversion and normalization
 * - API response/request processing
 * - Form data validation and sanitization
 * - Configuration value parsing
 * - Internationalization value transformation
 * - Database result formatting
 *
 * **Limitations:**
 * - Only processes enumerable own properties
 * - Doesn't handle Symbol keys
 * - Transformation function must be synchronous
 * - Context object reference is to original, not transformed values
 * - Performance impact grows linearly with object size
 */
export const transformValues = <
  Type extends object,
  Key extends keyof Type,
  Value,
>(
  object: Type,
  getValue: (value: Type[Key], key: Key, object: Type) => Value,
): Record<Key, Value> => {
  const result = {} as Record<Key, Value>;
  const keys = Object.keys(object);
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i] as Key;
    const value = object[key];
    result[key] = getValue(value, key, object);
  }
  return result;
};
