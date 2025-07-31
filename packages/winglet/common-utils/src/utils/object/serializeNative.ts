/**
 * Native JSON serialization with standard JavaScript behavior.
 *
 * Direct alias for the native JSON.stringify method, providing consistent serialization
 * behavior across the application. Handles undefined values by omitting them from the
 * serialized output and supports all standard JSON.stringify options including custom
 * replacer functions and formatting.
 *
 * @param value - Any serializable value to convert to JSON string
 * @param replacer - Function to transform values during serialization or array of property names to include (optional)
 * @param space - String for formatting or number of spaces for indentation (optional)
 * @returns JSON string representation of the value
 *
 * @example
 * Basic serialization:
 * ```typescript
 * import { serializeNative } from '@winglet/common-utils';
 *
 * // Simple object serialization
 * const user = { id: 1, name: 'John', active: true };
 * console.log(serializeNative(user)); // '{"id":1,"name":"John","active":true}'
 *
 * // Array serialization
 * const numbers = [1, 2, 3, 4, 5];
 * console.log(serializeNative(numbers)); // '[1,2,3,4,5]'
 *
 * // Primitive values
 * console.log(serializeNative('hello')); // '"hello"'
 * console.log(serializeNative(42)); // '42'
 * console.log(serializeNative(null)); // 'null'
 * ```
 *
 * @example
 * Undefined value handling:
 * ```typescript
 * // undefined properties are omitted
 * const data = { a: 1, b: undefined, c: 'hello' };
 * console.log(serializeNative(data)); // '{"a":1,"c":"hello"}'
 *
 * // undefined array elements become null
 * const array = [1, undefined, 3];
 * console.log(serializeNative(array)); // '[1,null,3]'
 *
 * // Direct undefined serialization
 * console.log(serializeNative(undefined)); // undefined (not a string)
 * ```
 *
 * @example
 * Pretty printing with formatting:
 * ```typescript
 * const data = { user: { name: 'Alice', age: 30 }, items: [1, 2, 3] };
 * 
 * // Compact (default)
 * console.log(serializeNative(data));
 * // '{"user":{"name":"Alice","age":30},"items":[1,2,3]}'
 *
 * // Pretty printed with 2 spaces
 * console.log(serializeNative(data, null, 2));
 * // {
 * //   "user": {
 * //     "name": "Alice",
 * //     "age": 30
 * //   },
 * //   "items": [1, 2, 3]
 * // }
 *
 * // Custom indentation string
 * console.log(serializeNative(data, null, '\t')); // Tab-indented
 * ```
 *
 * @example
 * Using replacer function for custom serialization:
 * ```typescript
 * const sensitiveData = {
 *   username: 'john_doe',
 *   password: 'secret123',
 *   email: 'john@example.com',
 *   apiKey: 'sk-abc123'
 * };
 *
 * // Hide sensitive fields
 * const safeReplacer = (key: string, value: any) => {
 *   const sensitiveFields = ['password', 'apiKey'];
 *   return sensitiveFields.includes(key) ? '[REDACTED]' : value;
 * };
 *
 * console.log(serializeNative(sensitiveData, safeReplacer));
 * // '{"username":"john_doe","password":"[REDACTED]","email":"john@example.com","apiKey":"[REDACTED]"}'
 * ```
 *
 * @example
 * Property filtering with replacer array:
 * ```typescript
 * const fullData = {
 *   id: 123,
 *   name: 'Product',
 *   price: 29.99,
 *   internalCode: 'ABC-123',
 *   debugInfo: { logs: [], errors: [] }
 * };
 *
 * // Only serialize specific properties
 * const publicFields = ['id', 'name', 'price'];
 * console.log(serializeNative(fullData, publicFields));
 * // '{"id":123,"name":"Product","price":29.99}'
 * ```
 *
 * @remarks
 * **Standard JSON Behavior:**
 * - Functions, undefined, and symbols are omitted from objects
 * - undefined array elements become null
 * - Date objects are serialized as ISO strings
 * - RegExp objects become empty objects {}
 * - Circular references throw TypeError
 *
 * **Use Cases:**
 * - API response serialization
 * - Configuration file generation
 * - Debug logging and data inspection
 * - Data persistence and storage
 * - Inter-service communication
 */
export const serializeNative = JSON.stringify;
