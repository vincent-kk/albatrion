/**
 * Creates a new array by applying a transformation function to each element of the source array.
 *
 * Transforms each element of the input array using the provided callback function and returns
 * a new array containing the transformed elements. The callback receives the current element,
 * its index, and the entire array as arguments, providing flexibility for complex transformations.
 *
 * @template Type - Type of input array elements
 * @template Result - Type of result array elements
 * @param array - Source array to transform
 * @param callback - Transformation function to apply to each element
 * @returns New transformed array
 *
 * @example
 * Basic transformation:
 * ```typescript
 * import { map } from '@winglet/common-utils';
 *
 * const numbers = [1, 2, 3, 4, 5];
 * const doubled = map(numbers, num => num * 2);
 * console.log(doubled); // [2, 4, 6, 8, 10]
 *
 * const strings = map(numbers, num => `Number: ${num}`);
 * console.log(strings); // ['Number: 1', 'Number: 2', 'Number: 3', 'Number: 4', 'Number: 5']
 * ```
 *
 * @example
 * Object transformation:
 * ```typescript
 * interface User {
 *   id: number;
 *   firstName: string;
 *   lastName: string;
 *   age: number;
 * }
 *
 * interface UserSummary {
 *   id: number;
 *   fullName: string;
 *   isAdult: boolean;
 * }
 *
 * const users: User[] = [
 *   { id: 1, firstName: 'Alice', lastName: 'Johnson', age: 30 },
 *   { id: 2, firstName: 'Bob', lastName: 'Smith', age: 17 },
 *   { id: 3, firstName: 'Charlie', lastName: 'Brown', age: 25 }
 * ];
 *
 * const userSummaries = map(users, (user): UserSummary => ({
 *   id: user.id,
 *   fullName: `${user.firstName} ${user.lastName}`,
 *   isAdult: user.age >= 18
 * }));
 * console.log(userSummaries);
 * // [
 * //   { id: 1, fullName: 'Alice Johnson', isAdult: true },
 * //   { id: 2, fullName: 'Bob Smith', isAdult: false },
 * //   { id: 3, fullName: 'Charlie Brown', isAdult: true }
 * // ]
 * ```
 *
 * @example
 * Using index in transformation:
 * ```typescript
 * const letters = ['a', 'b', 'c', 'd'];
 * const indexed = map(letters, (letter, index) => `${index}: ${letter}`);
 * console.log(indexed); // ['0: a', '1: b', '2: c', '3: d']
 *
 * // Create numbered list
 * const items = ['apple', 'banana', 'cherry'];
 * const numberedList = map(items, (item, index) => `${index + 1}. ${item}`);
 * console.log(numberedList); // ['1. apple', '2. banana', '3. cherry']
 * ```
 *
 * @example
 * Complex transformations with array context:
 * ```typescript
 * const scores = [85, 92, 78, 95, 88];
 * const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
 *
 * const gradeAnalysis = map(scores, (score, index, array) => ({
 *   position: index + 1,
 *   score,
 *   grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
 *   aboveAverage: score > average,
 *   rank: array.filter(s => s > score).length + 1,
 *   totalStudents: array.length
 * }));
 * console.log(gradeAnalysis);
 * ```
 *
 * @example
 * API response transformation:
 * ```typescript
 * interface ApiUser {
 *   user_id: number;
 *   first_name: string;
 *   last_name: string;
 *   email_address: string;
 *   created_at: string;
 * }
 *
 * interface ClientUser {
 *   id: number;
 *   name: string;
 *   email: string;
 *   createdDate: Date;
 * }
 *
 * const apiUsers: ApiUser[] = [
 *   { user_id: 1, first_name: 'John', last_name: 'Doe', email_address: 'john@example.com', created_at: '2024-01-15T10:30:00Z' }
 * ];
 *
 * const clientUsers = map(apiUsers, (apiUser): ClientUser => ({
 *   id: apiUser.user_id,
 *   name: `${apiUser.first_name} ${apiUser.last_name}`,
 *   email: apiUser.email_address,
 *   createdDate: new Date(apiUser.created_at)
 * }));
 * ```
 *
 * @example
 * Nested array processing:
 * ```typescript
 * const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
 * const rowSums = map(matrix, row => row.reduce((sum, val) => sum + val, 0));
 * console.log(rowSums); // [6, 15, 24]
 *
 * const flattened = map(matrix, (row, rowIndex) => 
 *   map(row, (val, colIndex) => ({ value: val, row: rowIndex, col: colIndex }))
 * );
 * ```
 *
 * @example
 * Conditional transformation:
 * ```typescript
 * const products = [
 *   { name: 'Laptop', price: 999, category: 'Electronics' },
 *   { name: 'Book', price: 29, category: 'Education' },
 *   { name: 'Phone', price: 699, category: 'Electronics' }
 * ];
 *
 * const displayProducts = map(products, product => ({
 *   ...product,
 *   displayPrice: product.price > 500 ? `$${product.price} (Premium)` : `$${product.price}`,
 *   isExpensive: product.price > 500,
 *   categoryIcon: product.category === 'Electronics' ? '📱' : '📚'
 * }));
 * ```
 *
 * @example
 * Error handling in transformation:
 * ```typescript
 * const jsonStrings = ['{"name": "Alice"}', 'invalid json', '{"name": "Bob"}'];
 * 
 * const parsed = map(jsonStrings, (jsonStr, index) => {
 *   try {
 *     return { success: true, data: JSON.parse(jsonStr), index };
 *   } catch (error) {
 *     return { success: false, error: 'Invalid JSON', index };
 *   }
 * });
 * console.log(parsed);
 * // [
 * //   { success: true, data: { name: 'Alice' }, index: 0 },
 * //   { success: false, error: 'Invalid JSON', index: 1 },
 * //   { success: true, data: { name: 'Bob' }, index: 2 }
 * // ]
 * ```
 *
 * @remarks
 * **Performance:** Uses pre-allocated array with known length for optimal memory usage
 * and performance. Time complexity is O(n) where n is the array length.
 *
 * **Callback Parameters:** The callback function receives three parameters:
 * - `item`: The current element being processed
 * - `index`: The index of the current element
 * - `array`: The entire source array
 *
 * **Immutability:** Does not modify the original array, returns a new transformed array.
 *
 * **Type Safety:** Supports transformation between different types through generic parameters.
 * TypeScript will infer the result type from the callback function's return type.
 *
 * **Memory Efficiency:** Pre-allocates the result array with the same length as the source
 * array to minimize memory allocations during transformation.
 */
export const map = <Type, Result = Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => Result,
): Result[] => {
  const result = new Array<Result>(array.length);
  for (let index = 0; index < array.length; index++)
    result[index] = callback(array[index], index, array);
  return result;
};
