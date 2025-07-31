import type { Dictionary, Nullish } from '@aileron/declare';

/**
 * Reorders object properties according to a specified key sequence with optional filtering.
 *
 * Creates a new object with properties arranged in the order specified by the keys array,
 * followed by any remaining properties in their original order. Supports undefined value
 * filtering and maintains type safety while providing flexible property organization for
 * consistent object structures and serialization.
 *
 * @template Dict - Dictionary type extending Record<PropertyKey, any>
 * @param object - Source object to reorder (null/undefined returns empty object)
 * @param keys - Array defining the desired property order
 * @param omitUndefined - Whether to exclude properties with undefined values (optional)
 * @returns New object with properties ordered according to keys array
 *
 * @example
 * Basic property ordering:
 * ```typescript
 * import { sortObjectKeys } from '@winglet/common-utils';
 *
 * // Reorder object properties
 * const user = { email: 'john@example.com', name: 'John', id: 123, active: true };
 * const ordered = sortObjectKeys(user, ['id', 'name', 'email', 'active']);
 * console.log(ordered); // { id: 123, name: 'John', email: 'john@example.com', active: true }
 *
 * // Partial ordering - specified keys first, others follow
 * const partialOrder = sortObjectKeys(user, ['name', 'id']);
 * console.log(partialOrder); // { name: 'John', id: 123, email: 'john@example.com', active: true }
 * ```
 *
 * @example
 * API response standardization:
 * ```typescript
 * // Standardize API response structure
 * const apiData = {
 *   metadata: { version: '1.0', timestamp: '2023-01-01' },
 *   data: { users: [...], count: 42 },
 *   status: 'success',
 *   message: 'Data retrieved successfully'
 * };
 *
 * // Ensure consistent property order
 * const standardOrder = ['status', 'message', 'data', 'metadata'];
 * const standardized = sortObjectKeys(apiData, standardOrder);
 * console.log(Object.keys(standardized)); // ['status', 'message', 'data', 'metadata']
 * ```
 *
 * @example
 * Undefined value filtering:
 * ```typescript
 * const incompleteData = {
 *   id: 1,
 *   name: 'Alice',
 *   email: undefined,  // Missing email
 *   phone: '+1234567890',
 *   address: undefined,  // Missing address
 *   active: true
 * };
 *
 * // Order with undefined values included
 * const withUndefined = sortObjectKeys(
 *   incompleteData, 
 *   ['id', 'name', 'email', 'phone'], 
 *   false
 * );
 * console.log(withUndefined);
 * // { id: 1, name: 'Alice', email: undefined, phone: '+1234567890', address: undefined, active: true }
 *
 * // Order with undefined values filtered out
 * const filtered = sortObjectKeys(
 *   incompleteData, 
 *   ['id', 'name', 'email', 'phone'], 
 *   true
 * );
 * console.log(filtered);
 * // { id: 1, name: 'Alice', phone: '+1234567890', active: true }
 * ```
 *
 * @example
 * Configuration object organization:
 * ```typescript
 * // Organize configuration with priority ordering
 * const config = {
 *   timeout: 5000,
 *   retries: 3,
 *   apiUrl: 'https://api.example.com',
 *   debug: false,
 *   version: '2.1.0',
 *   environment: 'production'
 * };
 *
 * // Critical settings first, then others
 * const priorityOrder = ['environment', 'version', 'apiUrl', 'timeout', 'retries'];
 * const organized = sortObjectKeys(config, priorityOrder);
 * console.log(Object.keys(organized));
 * // ['environment', 'version', 'apiUrl', 'timeout', 'retries', 'debug']
 * ```
 *
 * @example
 * Form field organization:
 * ```typescript
 * // Organize form data for consistent display
 * const formData = {
 *   newsletter: true,
 *   country: 'USA',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 *   phone: undefined,  // Optional field
 *   city: 'New York',
 *   zipCode: '10001'
 * };
 *
 * // Logical field order for forms
 * const fieldOrder = [
 *   'firstName', 'lastName', 'email', 'phone',
 *   'city', 'zipCode', 'country', 'newsletter'
 * ];
 * 
 * const orderedForm = sortObjectKeys(formData, fieldOrder, true);
 * console.log(orderedForm);
 * // {
 * //   firstName: 'John',
 * //   lastName: 'Doe', 
 * //   email: 'john@example.com',
 * //   city: 'New York',
 * //   zipCode: '10001',
 * //   country: 'USA',
 * //   newsletter: true
 * // }
 * ```
 *
 * @example
 * Database record normalization:
 * ```typescript
 * // Normalize database records for consistent output
 * const dbRecord = {
 *   updated_at: '2023-01-02T10:30:00Z',
 *   data: { content: 'Record content' },
 *   created_at: '2023-01-01T09:00:00Z',
 *   id: 'record_123',
 *   status: 'active',
 *   version: 1
 * };
 *
 * // Standard record structure
 * const recordOrder = ['id', 'status', 'version', 'created_at', 'updated_at'];
 * const normalized = sortObjectKeys(dbRecord, recordOrder);
 * console.log(Object.keys(normalized));
 * // ['id', 'status', 'version', 'created_at', 'updated_at', 'data']
 * ```
 *
 * @example
 * Handling edge cases:
 * ```typescript
 * // Empty and null objects
 * console.log(sortObjectKeys(null, ['a', 'b'])); // {}
 * console.log(sortObjectKeys(undefined, ['a', 'b'])); // {}
 * console.log(sortObjectKeys({}, ['a', 'b'])); // {}
 *
 * // Non-existent keys in order array
 * const obj = { x: 1, y: 2 };
 * const withNonExistent = sortObjectKeys(obj, ['a', 'x', 'b', 'y', 'c']);
 * console.log(withNonExistent); // { x: 1, y: 2 } (only existing keys included)
 *
 * // Objects with mixed undefined values
 * const mixed = { a: 1, b: undefined, c: 3, d: undefined, e: 5 };
 * const cleanOrdered = sortObjectKeys(mixed, ['e', 'c', 'a'], true);
 * console.log(cleanOrdered); // { e: 5, c: 3, a: 1 }
 * ```
 *
 * @example
 * JSON serialization preparation:
 * ```typescript
 * // Prepare objects for consistent JSON output
 * const responseData = {
 *   pagination: { page: 1, limit: 20, total: 100 },
 *   timestamp: Date.now(),
 *   data: [{ id: 1, name: 'Item 1' }],
 *   success: true,
 *   errors: undefined  // Sometimes present
 * };
 *
 * // Standard API response order
 * const apiOrder = ['success', 'data', 'pagination', 'timestamp', 'errors'];
 * const prepared = sortObjectKeys(responseData, apiOrder, true);
 * 
 * console.log(JSON.stringify(prepared, null, 2));
 * // {
 * //   "success": true,
 * //   "data": [{ "id": 1, "name": "Item 1" }],
 * //   "pagination": { "page": 1, "limit": 20, "total": 100 },
 * //   "timestamp": 1640995200000
 * // }
 * ```
 *
 * @remarks
 * **Ordering Strategy:**
 * - **Primary Order**: Properties appear in the sequence specified by keys array
 * - **Secondary Order**: Remaining properties follow in their original enumeration order
 * - **Missing Keys**: Keys in the order array that don't exist in the object are skipped
 * - **Extra Properties**: Properties not in the order array are appended at the end
 *
 * **Filtering Behavior:**
 * - **omitUndefined = false**: All properties included regardless of value
 * - **omitUndefined = true**: Properties with undefined values are excluded
 * - **Filtering Priority**: Applied during both ordered and remaining property processing
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n + m) where n is object size, m is keys array length
 * - **Space Complexity**: O(n) for the new object
 * - **Memory**: Creates new object, preserves original object unchanged
 *
 * **Type Safety:**
 * - Maintains original object type through generic constraints
 * - Preserves property value types after reordering
 * - Keys array accepts any string values (non-existent keys ignored)
 * - Return type matches input dictionary type
 *
 * **Use Cases:**
 * - API response structure standardization
 * - Form field organization and display order
 * - Configuration object normalization
 * - Database record formatting
 * - JSON serialization preparation
 * - Object property priority management
 *
 * **Limitations:**
 * - Only reorders enumerable own properties
 * - Does not handle Symbol keys
 * - String keys only in the ordering array
 * - Undefined filtering is binary (all or none)
 * - Original object structure is not preserved if circular references exist
 */
export const sortObjectKeys = <Dict extends Dictionary>(
  object: Nullish<Dict>,
  keys: string[],
  omitUndefined?: boolean,
): Dict => {
  if (!object) return {} as Dict;
  const result: Dictionary = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (!(key in object) || (omitUndefined && object[key] === undefined))
      continue;
    result[key] = object[key];
  }
  const objectKeys = Object.keys(object);
  for (let index = 0; index < objectKeys.length; index++) {
    const key = objectKeys[index];
    if (key in result || (omitUndefined && object[key] === undefined)) continue;
    result[key] = object[key];
  }
  return result as Dict;
};
