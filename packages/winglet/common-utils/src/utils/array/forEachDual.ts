/**
 * Iterates over two arrays simultaneously, executing a callback function for each element pair.
 *
 * When arrays have different lengths, iterates based on the longer array's length,
 * passing `undefined` for indices that exceed the shorter array's range. Supports
 * early termination when the callback returns `false`.
 *
 * @template Type1 - Type of the first array elements
 * @template Type2 - Type of the second array elements
 * @param array1 - First array to iterate over
 * @param array2 - Second array to iterate over
 * @param callback - Callback function to execute for each element pair
 *
 * @example
 * Iterate arrays of same length:
 * ```typescript
 * import { forEachDual } from '@winglet/common-utils';
 *
 * const names = ['Alice', 'Bob', 'Charlie'];
 * const ages = [30, 25, 35];
 *
 * forEachDual(names, ages, (name, age, index) => {
 *   console.log(`${index}: ${name} is ${age} years old`);
 * });
 * // Output: 0: Alice is 30 years old
 * //         1: Bob is 25 years old
 * //         2: Charlie is 35 years old
 * ```
 *
 * @example
 * Handle arrays of different lengths:
 * ```typescript
 * const products = ['Laptop', 'Phone', 'Tablet', 'Watch'];
 * const prices = [999, 699, 399]; // Shorter array
 *
 * forEachDual(products, prices, (product, price, index) => {
 *   if (product === undefined) {
 *     console.log(`${index}: No product, price: ${price}`);
 *   } else if (price === undefined) {
 *     console.log(`${index}: ${product} - No price available`);
 *   } else {
 *     console.log(`${index}: ${product} costs $${price}`);
 *   }
 * });
 * // Output: 0: Laptop costs $999
 * //         1: Phone costs $699
 * //         2: Tablet costs $399
 * //         3: Watch - No price available
 * ```
 *
 * @example
 * Early termination:
 * ```typescript
 * const numbers1 = [1, 2, 3, 4, 5];
 * const numbers2 = [10, 20, 30, 40, 50];
 *
 * forEachDual(numbers1, numbers2, (a, b, index) => {
 *   const sum = (a || 0) + (b || 0);
 *   console.log(`${index}: ${a} + ${b} = ${sum}`);
 *   
 *   if (sum > 50) {
 *     console.log('Sum exceeded 50, stopping');
 *     return false; // Stop iteration
 *   }
 * });
 * // Output: 0: 1 + 10 = 11
 * //         1: 2 + 20 = 22
 * //         2: 3 + 30 = 33
 * //         3: 4 + 40 = 44
 * //         4: 5 + 50 = 55
 * //         Sum exceeded 50, stopping
 * ```
 *
 * @example
 * Compare and merge data:
 * ```typescript
 * interface OldUser { id: number; name: string; }
 * interface NewUser { id: number; email: string; }
 *
 * const oldUsers: OldUser[] = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' }
 * ];
 *
 * const newUsers: NewUser[] = [
 *   { id: 1, email: 'alice@example.com' },
 *   { id: 2, email: 'bob@example.com' },
 *   { id: 3, email: 'charlie@example.com' }
 * ];
 *
 * const mergedUsers: Array<{id: number; name?: string; email?: string}> = [];
 *
 * forEachDual(oldUsers, newUsers, (oldUser, newUser, index) => {
 *   const merged = {
 *     id: oldUser?.id || newUser?.id || index,
 *     name: oldUser?.name,
 *     email: newUser?.email
 *   };
 *   mergedUsers.push(merged);
 * });
 * 
 * console.log(mergedUsers);
 * // [
 * //   { id: 1, name: 'Alice', email: 'alice@example.com' },
 * //   { id: 2, name: 'Bob', email: 'bob@example.com' },
 * //   { id: 3, name: undefined, email: 'charlie@example.com' }
 * // ]
 * ```
 *
 * @example
 * Parallel processing with validation:
 * ```typescript
 * const inputs = ['10', '20', 'invalid', '40'];
 * const expected = [10, 20, 30, 40];
 *
 * forEachDual(inputs, expected, (input, expectedValue, index, arr1, arr2) => {
 *   if (input === undefined || expectedValue === undefined) {
 *     console.log(`${index}: Missing data`);
 *     return;
 *   }
 *
 *   const parsed = parseInt(input);
 *   if (isNaN(parsed)) {
 *     console.log(`${index}: Invalid input "${input}"`);
 *     return false; // Stop on invalid data
 *   }
 *
 *   const isMatch = parsed === expectedValue;
 *   console.log(`${index}: ${input} -> ${parsed}, expected ${expectedValue}, match: ${isMatch}`);
 * });
 * ```
 *
 * @example
 * Working with coordinates:
 * ```typescript
 * const xCoords = [1, 3, 5, 7];
 * const yCoords = [2, 4, 6]; // One less element
 *
 * const points: Array<{x: number; y: number}> = [];
 *
 * forEachDual(xCoords, yCoords, (x, y, index) => {
 *   if (x !== undefined && y !== undefined) {
 *     points.push({ x, y });
 *     console.log(`Point ${index}: (${x}, ${y})`);
 *   } else {
 *     console.log(`Point ${index}: Incomplete coordinates (${x}, ${y})`);
 *   }
 * });
 * // Output: Point 0: (1, 2)
 * //         Point 1: (3, 4)
 * //         Point 2: (5, 6)
 * //         Point 3: Incomplete coordinates (7, undefined)
 * ```
 *
 * @remarks
 * **Length Handling:** Iterates based on the longer array's length. Elements from
 * the shorter array are `undefined` when their indices are out of bounds.
 *
 * **Early Termination:** Iteration stops immediately when the callback returns `false`.
 * Any other return value (including `undefined`) continues the iteration.
 *
 * **Callback Parameters:** The callback function receives five parameters:
 * - `item1`: Current element from first array (or `undefined`)
 * - `item2`: Current element from second array (or `undefined`)
 * - `index`: Current index in the iteration
 * - `array1`: The entire first array
 * - `array2`: The entire second array
 *
 * **Performance:** Uses Math.max to determine iteration length and direct array access
 * for optimal performance with minimal overhead.
 */
export const forEachDual = <Type1, Type2>(
  array1: Type1[],
  array2: Type2[],
  callback: (
    item1: Type1 | undefined,
    item2: Type2 | undefined,
    index: number,
    array1: Type1[],
    array2: Type2[],
  ) => boolean | void,
) => {
  const array1Length = array1.length;
  const array2Length = array2.length;
  const length = Math.max(array1Length, array2Length);
  for (let i = 0; i < length; i++) {
    const item1 = i < array1Length ? array1[i] : undefined;
    const item2 = i < array2Length ? array2[i] : undefined;
    if (callback(item1, item2, i, array1, array2) === false) break;
  }
};
