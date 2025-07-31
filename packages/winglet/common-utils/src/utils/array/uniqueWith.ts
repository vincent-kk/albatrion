/**
 * Removes duplicate elements from an array using a custom comparison function to determine equality.
 *
 * Creates a new array containing elements where no two elements are considered equal
 * according to the provided comparison function. Only the first occurrence of elements
 * considered equal is retained. This provides maximum flexibility for defining custom
 * equality logic that cannot be expressed through simple value transformation.
 *
 * @template Type - Type of array elements
 * @param source - Source array to remove duplicates from
 * @param isEqual - Comparison function to determine if two elements are equal
 * @returns Array with duplicates removed based on custom equality
 *
 * @example
 * Case-insensitive string deduplication:
 * ```typescript
 * import { uniqueWith } from '@winglet/common-utils';
 *
 * const names = ['Alice', 'BOB', 'alice', 'Charlie', 'bob', 'CHARLIE'];
 * const uniqueNames = uniqueWith(names, (a, b) => a.toLowerCase() === b.toLowerCase());
 * console.log(uniqueNames); // ['Alice', 'BOB', 'Charlie']
 * ```
 *
 * @example
 * Object deduplication with multiple criteria:
 * ```typescript
 * interface Person {
 *   firstName: string;
 *   lastName: string;
 *   age: number;
 *   email: string;
 * }
 *
 * const people: Person[] = [
 *   { firstName: 'John', lastName: 'Doe', age: 30, email: 'john@example.com' },
 *   { firstName: 'Jane', lastName: 'Smith', age: 25, email: 'jane@example.com' },
 *   { firstName: 'John', lastName: 'Doe', age: 31, email: 'john.doe@example.com' }, // Same name, different age/email
 *   { firstName: 'Bob', lastName: 'Johnson', age: 35, email: 'bob@example.com' }
 * ];
 *
 * // Remove duplicates based on first and last name only
 * const uniquePeople = uniqueWith(people, (a, b) => 
 *   a.firstName === b.firstName && a.lastName === b.lastName
 * );
 * console.log(uniquePeople);
 * // [
 * //   { firstName: 'John', lastName: 'Doe', age: 30, email: 'john@example.com' },
 * //   { firstName: 'Jane', lastName: 'Smith', age: 25, email: 'jane@example.com' },
 * //   { firstName: 'Bob', lastName: 'Johnson', age: 35, email: 'bob@example.com' }
 * // ]
 * ```
 *
 * @example
 * Approximate numeric comparison:
 * ```typescript
 * const measurements = [1.0, 1.05, 2.0, 1.98, 3.0, 2.95, 4.0];
 * const tolerance = 0.1;
 *
 * const uniqueMeasurements = uniqueWith(measurements, (a, b) => 
 *   Math.abs(a - b) < tolerance
 * );
 * console.log(uniqueMeasurements); // [1.0, 2.0, 3.0, 4.0]
 * // Values within 0.1 of each other are considered duplicates
 * ```
 *
 * @example
 * Date comparison ignoring time:
 * ```typescript
 * const events = [
 *   { name: 'Meeting', date: new Date('2024-01-15T09:00:00Z') },
 *   { name: 'Lunch', date: new Date('2024-01-15T12:00:00Z') },
 *   { name: 'Conference', date: new Date('2024-01-16T10:00:00Z') },
 *   { name: 'Workshop', date: new Date('2024-01-15T15:00:00Z') }
 * ];
 *
 * // Remove events on the same day (ignoring time)
 * const uniqueByDate = uniqueWith(events, (a, b) => 
 *   a.date.toDateString() === b.date.toDateString()
 * );
 * console.log(uniqueByDate);
 * // [
 * //   { name: 'Meeting', date: ... }, // Jan 15
 * //   { name: 'Conference', date: ... } // Jan 16
 * // ]
 * ```
 *
 * @example
 * Complex array comparison:
 * ```typescript
 * const coordinates = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [1, 2, 3], // Duplicate
 *   [7, 8, 9],
 *   [4, 5, 6]  // Duplicate
 * ];
 *
 * const uniqueCoordinates = uniqueWith(coordinates, (a, b) => 
 *   a.length === b.length && a.every((val, idx) => val === b[idx])
 * );
 * console.log(uniqueCoordinates); // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * ```
 *
 * @example
 * Object deep comparison:
 * ```typescript
 * interface Product {
 *   id: number;
 *   specs: {
 *     cpu: string;
 *     ram: number;
 *   };
 * }
 *
 * const products: Product[] = [
 *   { id: 1, specs: { cpu: 'Intel i5', ram: 8 } },
 *   { id: 2, specs: { cpu: 'Intel i7', ram: 16 } },
 *   { id: 3, specs: { cpu: 'Intel i5', ram: 8 } }, // Same specs as id: 1
 *   { id: 4, specs: { cpu: 'AMD Ryzen', ram: 16 } }
 * ];
 *
 * // Remove products with identical specifications
 * const uniqueBySpecs = uniqueWith(products, (a, b) => 
 *   a.specs.cpu === b.specs.cpu && a.specs.ram === b.specs.ram
 * );
 * console.log(uniqueBySpecs);
 * // [
 * //   { id: 1, specs: { cpu: 'Intel i5', ram: 8 } },
 * //   { id: 2, specs: { cpu: 'Intel i7', ram: 16 } },
 * //   { id: 4, specs: { cpu: 'AMD Ryzen', ram: 16 } }
 * // ]
 * ```
 *
 * @example
 * Geographic proximity deduplication:
 * ```typescript
 * interface Location {
 *   name: string;
 *   lat: number;
 *   lng: number;
 * }
 *
 * const locations: Location[] = [
 *   { name: 'Store A', lat: 40.7128, lng: -74.0060 },
 *   { name: 'Store B', lat: 40.7130, lng: -74.0062 }, // Very close to Store A
 *   { name: 'Store C', lat: 41.8781, lng: -87.6298 },
 *   { name: 'Store D', lat: 40.7129, lng: -74.0061 }  // Very close to Store A
 * ];
 *
 * const proximityThreshold = 0.01; // Degrees
 *
 * const uniqueLocations = uniqueWith(locations, (a, b) => {
 *   const latDiff = Math.abs(a.lat - b.lat);
 *   const lngDiff = Math.abs(a.lng - b.lng);
 *   return latDiff < proximityThreshold && lngDiff < proximityThreshold;
 * });
 * console.log(uniqueLocations);
 * // [{ name: 'Store A', ... }, { name: 'Store C', ... }]
 * ```
 *
 * @example
 * Version comparison with semantic versioning:
 * ```typescript
 * const versions = ['1.0.0', '1.0.1', '1.0.0', '2.0.0', '1.0.1', '1.1.0'];
 * 
 * const parseVersion = (version: string) => version.split('.').map(Number);
 * const compareVersions = (a: string, b: string) => {
 *   const [aMajor, aMinor, aPatch] = parseVersion(a);
 *   const [bMajor, bMinor, bPatch] = parseVersion(b);
 *   return aMajor === bMajor && aMinor === bMinor && aPatch === bPatch;
 * };
 *
 * const uniqueVersions = uniqueWith(versions, compareVersions);
 * console.log(uniqueVersions); // ['1.0.0', '1.0.1', '2.0.0', '1.1.0']
 * ```
 *
 * @example
 * Custom object equality with partial matching:
 * ```typescript
 * interface Task {
 *   id: number;
 *   title: string;
 *   priority: 'low' | 'medium' | 'high';
 *   assignee: string;
 * }
 *
 * const tasks: Task[] = [
 *   { id: 1, title: 'Fix bug', priority: 'high', assignee: 'Alice' },
 *   { id: 2, title: 'Add feature', priority: 'medium', assignee: 'Bob' },
 *   { id: 3, title: 'Fix bug', priority: 'high', assignee: 'Charlie' }, // Same title & priority
 *   { id: 4, title: 'Review code', priority: 'low', assignee: 'Alice' }
 * ];
 *
 * // Remove tasks with same title and priority (ignore assignee)
 * const uniqueTasks = uniqueWith(tasks, (a, b) => 
 *   a.title === b.title && a.priority === b.priority
 * );
 * console.log(uniqueTasks);
 * // [
 * //   { id: 1, title: 'Fix bug', priority: 'high', assignee: 'Alice' },
 * //   { id: 2, title: 'Add feature', priority: 'medium', assignee: 'Bob' },
 * //   { id: 4, title: 'Review code', priority: 'low', assignee: 'Alice' }
 * // ]
 * ```
 *
 * @remarks
 * **Performance:** Uses nested loops with O(n²) time complexity in worst case where
 * n is the array length. Consider using `uniqueBy` with a hash function for large arrays
 * when possible.
 *
 * **Comparison Function:** The `isEqual` function should be pure and symmetric.
 * If `isEqual(a, b)` returns true, then `isEqual(b, a)` should also return true.
 *
 * **First Occurrence:** When multiple elements are considered equal according to
 * the comparison function, only the first occurrence is retained in the result.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 *
 * **Memory Efficiency:** Uses a simple result array with direct indexing. The comparison
 * function is called for each pair until a match is found or all comparisons are complete.
 */
export const uniqueWith = <Type>(
  source: Type[],
  isEqual: (item1: Type, item2: Type) => boolean,
): Type[] => {
  const result: Type[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++)
      if (isEqual(item, result[j])) {
        isDuplicate = true;
        break;
      }
    if (!isDuplicate) result[result.length] = item;
  }
  return result;
};
