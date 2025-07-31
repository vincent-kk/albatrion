/**
 * Returns elements from the source array that are not present in the exclude array,
 * using a custom comparison function to determine element equality.
 *
 * Creates a new array containing elements from the source array that do not have
 * matching elements in the exclude array based on a custom equality comparison.
 * This is useful when you need complex comparison logic that cannot be expressed
 * with simple value transformation.
 *
 * @template Type1 - Type of the source array elements
 * @template Type2 - Type of the exclude array elements
 * @param source - Source array that serves as the base for comparison
 * @param exclude - Array containing elements to exclude from the result
 * @param isEqual - Comparison function to determine if two elements are equal
 * @returns Array of elements that exist only in the source array
 *
 * @example
 * Compare objects with custom logic:
 * ```typescript
 * import { differenceWith } from '@winglet/common-utils';
 *
 * const products = [
 *   { id: 1, name: 'iPhone', price: 999 },
 *   { id: 2, name: 'iPad', price: 799 },
 *   { id: 3, name: 'MacBook', price: 1299 }
 * ];
 *
 * const discontinued = [
 *   { id: 1, name: 'iPhone', price: 899 }, // Different price, same product
 *   { id: 4, name: 'iPod', price: 199 }
 * ];
 *
 * // Compare by name only, ignoring price differences
 * const result = differenceWith(
 *   products, 
 *   discontinued, 
 *   (a, b) => a.name === b.name
 * );
 * console.log(result); // [{ id: 2, name: 'iPad', ... }, { id: 3, name: 'MacBook', ... }]
 * ```
 *
 * @example
 * Case-insensitive string comparison:
 * ```typescript
 * const originalList = ['Apple', 'Banana', 'Orange', 'Grape'];
 * const toRemove = ['apple', 'BANANA'];
 *
 * const result = differenceWith(
 *   originalList, 
 *   toRemove, 
 *   (a, b) => a.toLowerCase() === b.toLowerCase()
 * );
 * console.log(result); // ['Orange', 'Grape']
 * ```
 *
 * @example
 * Complex object comparison with multiple criteria:
 * ```typescript
 * interface Person {
 *   firstName: string;
 *   lastName: string;
 *   age: number;
 *   email: string;
 * }
 *
 * const allPeople: Person[] = [
 *   { firstName: 'John', lastName: 'Doe', age: 30, email: 'john@example.com' },
 *   { firstName: 'Jane', lastName: 'Doe', age: 28, email: 'jane@example.com' },
 *   { firstName: 'Bob', lastName: 'Smith', age: 35, email: 'bob@example.com' }
 * ];
 *
 * const duplicates: Person[] = [
 *   { firstName: 'John', lastName: 'Doe', age: 31, email: 'john.doe@example.com' } // Different age and email
 * ];
 *
 * // Compare by first and last name only
 * const result = differenceWith(
 *   allPeople, 
 *   duplicates, 
 *   (a, b) => a.firstName === b.firstName && a.lastName === b.lastName
 * );
 * console.log(result); // [{ firstName: 'Jane', ... }, { firstName: 'Bob', ... }]
 * ```
 *
 * @example
 * Approximate numeric comparison:
 * ```typescript
 * const measurements = [1.0, 2.5, 3.7, 4.9, 5.1];
 * const targets = [1.1, 5.0]; // Close approximations
 *
 * const result = differenceWith(
 *   measurements, 
 *   targets, 
 *   (a, b) => Math.abs(a - b) < 0.2 // Within 0.2 tolerance
 * );
 * console.log(result); // [2.5, 3.7, 4.9]
 * ```
 *
 * @example
 * Array comparison:
 * ```typescript
 * const coordinates = [[1, 2], [3, 4], [5, 6], [7, 8]];
 * const toExclude = [[1, 2], [5, 6]];
 *
 * const result = differenceWith(
 *   coordinates, 
 *   toExclude, 
 *   (a, b) => a[0] === b[0] && a[1] === b[1]
 * );
 * console.log(result); // [[3, 4], [7, 8]]
 * ```
 *
 * @example
 * Date comparison with custom logic:
 * ```typescript
 * const events = [
 *   { name: 'Meeting', date: new Date('2024-01-15') },
 *   { name: 'Conference', date: new Date('2024-02-20') },
 *   { name: 'Workshop', date: new Date('2024-03-10') }
 * ];
 *
 * const conflicts = [
 *   { name: 'Other Meeting', date: new Date('2024-01-15') }
 * ];
 *
 * // Compare by date only, ignore event names
 * const result = differenceWith(
 *   events, 
 *   conflicts, 
 *   (a, b) => a.date.getTime() === b.date.getTime()
 * );
 * console.log(result); // [{ name: 'Conference', ... }, { name: 'Workshop', ... }]
 * ```
 *
 * @remarks
 * **Performance:** Uses nested loops with O(n×m) time complexity where n is source length
 * and m is exclude length. Consider using `differenceBy` with a hash function for large arrays.
 *
 * **Comparison Function:** The `isEqual` function should be pure and symmetric.
 * It receives elements from source as first parameter and exclude as second parameter.
 *
 * **Type Safety:** Supports different types for source and exclude arrays as long as
 * the comparison function can handle both types.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 */
export const differenceWith = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  isEqual: (source: Type1, exclude: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isFound = false;
    for (let j = 0; j < exclude.length; j++)
      if (isEqual(item, exclude[j])) {
        isFound = true;
        break;
      }
    if (!isFound) result[result.length] = item;
  }
  return result;
};
