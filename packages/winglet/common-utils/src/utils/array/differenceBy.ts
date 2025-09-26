/**
 * Returns elements from the source array that are not present in the exclude array,
 * using a transformation function to determine element equality.
 *
 * Creates a new array containing elements from the source array that do not have
 * matching transformed values in the exclude array. The mapper function is applied
 * to elements from both arrays to extract comparable values.
 *
 * @template Type1 - Type of the source array elements
 * @template Type2 - Type of the exclude array elements
 * @param source - Source array that serves as the base for comparison
 * @param exclude - Array containing elements to exclude from the result
 * @param mapper - Function to transform array elements into comparable values
 * @returns Array of elements that exist only in the source array
 *
 * @example
 * Compare objects by ID:
 * ```typescript
 * import { differenceBy } from '@winglet/common-utils';
 *
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 3, name: 'Charlie' }
 * ];
 * const toRemove = [
 *   { id: 1, name: 'Alice Updated' },
 *   { id: 2, name: 'Bob Updated' }
 * ];
 *
 * const result = differenceBy(users, toRemove, user => user.id);
 * console.log(result); // [{ id: 3, name: 'Charlie' }]
 * ```
 *
 * @example
 * Compare strings by length:
 * ```typescript
 * const words = ['apple', 'banana', 'apricot', 'cherry'];
 * const excludeWords = ['grape', 'lemon']; // length 5
 *
 * const result = differenceBy(words, excludeWords, word => word.length);
 * console.log(result); // ['banana', 'apricot', 'cherry'] (apple excluded, length 5)
 * ```
 *
 * @example
 * Complex object comparison:
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   department: string;
 *   role: string;
 * }
 *
 * const employees: User[] = [
 *   { id: 1, name: 'John', department: 'IT', role: 'admin' },
 *   { id: 2, name: 'Jane', department: 'HR', role: 'user' },
 *   { id: 3, name: 'Bob', department: 'IT', role: 'admin' }
 * ];
 *
 * const toExclude: User[] = [
 *   { id: 1, name: 'John Smith', department: 'IT', role: 'admin' },
 *   { id: 2, name: 'Jane Doe', department: 'HR', role: 'user' }
 * ];
 *
 * // Compare by department-role combination
 * const result = differenceBy(
 *   employees,
 *   toExclude,
 *   user => `${user.department}-${user.role}`
 * );
 * console.log(result); // [{ id: 3, name: 'Bob', ... }]
 * ```
 *
 * @example
 * Nested object comparison:
 * ```typescript
 * const products = [
 *   { id: 1, details: { category: 'electronics', price: 100 } },
 *   { id: 2, details: { category: 'books', price: 20 } },
 *   { id: 3, details: { category: 'electronics', price: 200 } }
 * ];
 *
 * const excludeProducts = [
 *   { id: 1, details: { category: 'electronics', price: 150 } }
 * ];
 *
 * const result = differenceBy(
 *   products,
 *   excludeProducts,
 *   product => product.details.category
 * );
 * console.log(result); // [{ id: 2, details: { category: 'books', ... } }]
 * ```
 *
 * @example
 * Working with different types:
 * ```typescript
 * interface Person { name: string; age: number; }
 * interface Employee { name: string; age: number; id: number; }
 *
 * const people: Person[] = [
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 },
 *   { name: 'Charlie', age: 35 }
 * ];
 *
 * const employees: Employee[] = [
 *   { name: 'Alice', age: 30, id: 1 },
 *   { name: 'Bob', age: 25, id: 2 }
 * ];
 *
 * const nonEmployees = differenceBy(people, employees, person => person.name);
 * console.log(nonEmployees); // [{ name: 'Charlie', age: 35 }]
 * ```
 *
 * @remarks
 * **Performance:** Uses Set for O(1) average case lookup after mapping exclude array.
 * Time complexity is O(n + m) where n is source length and m is exclude length.
 *
 * **Mapper Function:** The mapper function is called once for each element in both arrays.
 * Ensure the mapper function is pure and returns consistent values for the same input.
 *
 * **Type Safety:** Supports different types for source and exclude arrays as long as
 * the mapper function can handle both types and returns comparable values.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 */
export const differenceBy = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const excludeSet = new Set<unknown>();
  for (let i = 0, l = exclude.length; i < l; i++)
    excludeSet.add(mapper(exclude[i]));
  const result: Type1[] = [];
  for (let i = 0, e = source[0], l = source.length; i < l; i++, e = source[i]) {
    const mappedItem = mapper(e);
    if (!excludeSet.has(mappedItem)) result[result.length] = e;
  }
  return result;
};
