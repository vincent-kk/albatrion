/**
 * Transforms object keys while preserving values and structure.
 *
 * Creates a new object by applying a transformation function to each key while
 * keeping all values unchanged. Useful for key normalization, naming convention
 * changes, and object schema transformations. Maintains type safety through
 * generic constraints and preserves object relationships.
 *
 * @template Type - Input object type extending Record<PropertyKey, any>
 * @template Key - Output key type after transformation (extends PropertyKey)
 * @param object - Object whose keys will be transformed
 * @param getKey - Function that transforms each key, receives (value, key, object)
 * @returns New object with transformed keys and original values
 *
 * @example
 * Basic key transformation:
 * ```typescript
 * import { transformKeys } from '@winglet/common-utils';
 *
 * // Add prefix to all keys
 * const data = { name: 'John', age: 30, city: 'NYC' };
 * const prefixed = transformKeys(data, (_, key) => `user_${key}`);
 * console.log(prefixed); // { user_name: 'John', user_age: 30, user_city: 'NYC' }
 *
 * // Convert to uppercase
 * const uppercase = transformKeys(data, (_, key) => key.toUpperCase());
 * console.log(uppercase); // { NAME: 'John', AGE: 30, CITY: 'NYC' }
 * ```
 *
 * @example
 * Case conversion and normalization:
 * ```typescript
 * // Snake case to camel case
 * const snakeCase = {
 *   user_name: 'Alice',
 *   first_name: 'Alice',
 *   last_name: 'Smith',
 *   email_address: 'alice@example.com'
 * };
 *
 * const camelCase = transformKeys(snakeCase, (_, key) => 
 *   key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
 * );
 * console.log(camelCase);
 * // { userName: 'Alice', firstName: 'Alice', lastName: 'Smith', emailAddress: 'alice@example.com' }
 *
 * // Camel case to kebab case
 * const kebabCase = transformKeys(camelCase, (_, key) =>
 *   key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
 * );
 * console.log(kebabCase);
 * // { 'user-name': 'Alice', 'first-name': 'Alice', 'last-name': 'Smith', 'email-address': 'alice@example.com' }
 * ```
 *
 * @example
 * Value-dependent key transformation:
 * ```typescript
 * // Transform keys based on their values
 * const config = {
 *   debug: true,
 *   timeout: 5000,
 *   retries: 3,
 *   enabled: false
 * };
 *
 * // Add type suffix based on value type
 * const typed = transformKeys(config, (value, key) => {
 *   const type = typeof value;
 *   return `${key}_${type}`;
 * });
 * console.log(typed);
 * // { debug_boolean: true, timeout_number: 5000, retries_number: 3, enabled_boolean: false }
 *
 * // Prefix based on value
 * const prefixed = transformKeys(config, (value, key) => 
 *   value === true ? `enabled_${key}` : 
 *   value === false ? `disabled_${key}` : 
 *   `config_${key}`
 * );
 * console.log(prefixed);
 * // { enabled_debug: true, config_timeout: 5000, config_retries: 3, disabled_enabled: false }
 * ```
 *
 * @example
 * API response transformation:
 * ```typescript
 * // Transform API response keys to match frontend naming
 * const apiResponse = {
 *   user_id: 123,
 *   user_name: 'john_doe',
 *   created_at: '2023-01-01T00:00:00Z',
 *   updated_at: '2023-01-02T12:00:00Z',
 *   is_active: true,
 *   profile_image_url: 'https://example.com/image.jpg'
 * };
 *
 * const frontendFormat = transformKeys(apiResponse, (_, key) => {
 *   // Convert snake_case to camelCase
 *   return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
 * });
 * 
 * console.log(frontendFormat);
 * // {
 * //   userId: 123,
 * //   userName: 'john_doe',
 * //   createdAt: '2023-01-01T00:00:00Z',
 * //   updatedAt: '2023-01-02T12:00:00Z',
 * //   isActive: true,
 * //   profileImageUrl: 'https://example.com/image.jpg'
 * // }
 * ```
 *
 * @example
 * Database column mapping:
 * ```typescript
 * // Map database columns to domain model properties
 * const dbRecord = {
 *   id: 1,
 *   usr_nm: 'alice',
 *   eml_addr: 'alice@example.com',
 *   crt_dt: '2023-01-01',
 *   updt_dt: '2023-01-02'
 * };
 *
 * const columnMapping = {
 *   id: 'id',
 *   usr_nm: 'username', 
 *   eml_addr: 'email',
 *   crt_dt: 'createdDate',
 *   updt_dt: 'updatedDate'
 * };
 *
 * const domainModel = transformKeys(dbRecord, (_, key) => 
 *   columnMapping[key] || key
 * );
 * 
 * console.log(domainModel);
 * // {
 * //   id: 1,
 * //   username: 'alice',
 * //   email: 'alice@example.com',
 * //   createdDate: '2023-01-01',
 * //   updatedDate: '2023-01-02'
 * // }
 * ```
 *
 * @example
 * Advanced transformation with context:
 * ```typescript
 * // Use full object context for complex transformations
 * const userProfile = {
 *   name: 'John',
 *   age: 30,
 *   role: 'admin',
 *   permissions: ['read', 'write', 'delete']
 * };
 *
 * // Add role-based prefixes
 * const roleBasedKeys = transformKeys(userProfile, (value, key, obj) => {
 *   const rolePrefix = obj.role === 'admin' ? 'admin_' : 'user_';
 *   return key === 'role' ? key : `${rolePrefix}${key}`;
 * });
 * 
 * console.log(roleBasedKeys);
 * // {
 * //   admin_name: 'John',
 * //   admin_age: 30,
 * //   role: 'admin',
 * //   admin_permissions: ['read', 'write', 'delete']
 * // }
 * ```
 *
 * @example
 * Key sanitization and validation:
 * ```typescript
 * // Sanitize keys for safe property access
 * const unsafeKeys = {
 *   'user name': 'John',
 *   'user-age': 30,
 *   'user.email': 'john@example.com',
 *   '123invalid': 'value',
 *   'valid_key': 'good'
 * };
 *
 * const sanitized = transformKeys(unsafeKeys, (_, key) => {
 *   // Replace invalid characters and ensure valid identifier
 *   let clean = key.replace(/[^a-zA-Z0-9_]/g, '_');
 *   // Ensure it doesn't start with a number
 *   if (/^\d/.test(clean)) {
 *     clean = `key_${clean}`;
 *   }
 *   return clean;
 * });
 * 
 * console.log(sanitized);
 * // {
 * //   user_name: 'John',
 * //   user_age: 30,
 * //   user_email: 'john@example.com',
 * //   key_123invalid: 'value',
 * //   valid_key: 'good'
 * // }
 * ```
 *
 * @remarks
 * **Transformation Process:**
 * - Iterates through all enumerable own properties using Object.keys()
 * - Calls transformation function for each property with (value, key, object)
 * - Creates new object with transformed keys and original values
 * - Maintains property enumeration order
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n) where n is number of properties
 * - **Space Complexity**: O(n) for the new object
 * - **Memory**: Creates entirely new object, doesn't modify original
 *
 * **Type Safety:**
 * - Input object type is preserved for value access
 * - Output key type is inferred from transformation function return
 * - Values maintain their original types
 * - Provides full TypeScript support with generics
 *
 * **TypeScript Limitations and Workarounds:**
 * ```typescript
 * // Limitation: Key type inference
 * const obj = { a: 1, b: 2 };
 * const result = transformKeys(obj, (_, key) => key.toUpperCase());
 * // Result type: Record<string, number> (loses specific key info)
 * 
 * // Workaround: Explicit typing
 * const betterResult = transformKeys(obj, (_, key) => key.toUpperCase()) as Record<'A' | 'B', number>;
 * 
 * // Limitation: Dynamic key generation
 * const dynamic = transformKeys(obj, (_, key) => Math.random() > 0.5 ? key : 'default');
 * // TypeScript can't track conditional key logic
 * 
 * // Limitation: Non-string key return
 * const symbolKeys = transformKeys(obj, () => Symbol('key'));
 * // Works at runtime but type checking may be limited
 * ```
 *
 * **Use Cases:**
 * - API response/request format conversion
 * - Database column to domain model mapping
 * - Naming convention standardization
 * - Key sanitization and validation
 * - Schema transformation and migration
 * - Internationalization key mapping
 *
 * **Limitations:**
 * - Only processes enumerable own properties
 * - Doesn't handle Symbol keys
 * - Key collisions after transformation may overwrite values
 * - Circular references in transformation logic may cause issues
 * - Performance impact grows linearly with object size
 */
export const transformKeys = <
  Type extends Record<PropertyKey, any>,
  Key extends PropertyKey,
>(
  object: Type,
  getKey: (value: Type[keyof Type], key: keyof Type, object: Type) => Key,
): Record<Key, Type[keyof Type]> => {
  const result = {} as Record<Key, Type[keyof Type]>;
  const keys = Object.keys(object) as Array<keyof Type>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = object[key];
    result[getKey(value, key, object)] = value;
  }
  return result;
};
