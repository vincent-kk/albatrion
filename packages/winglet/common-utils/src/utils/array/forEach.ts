/**
 * Executes a callback function for each element in an array with early termination support.
 *
 * Iterates through each element of the array and executes the provided callback function.
 * If the callback returns `false`, the iteration stops immediately. This provides
 * more control than the standard forEach by allowing early exit from the loop.
 *
 * @template Type - Type of array elements
 * @param array - Array to iterate over
 * @param callback - Callback function to apply to each element. Stops iteration if returns false
 *
 * @example
 * Basic iteration:
 * ```typescript
 * import { forEach } from '@winglet/common-utils';
 *
 * const numbers = [1, 2, 3, 4, 5];
 * forEach(numbers, (num, index) => {
 *   console.log(`Index ${index}: ${num}`);
 *   // No return value - continues iteration
 * });
 * // Output: Index 0: 1, Index 1: 2, Index 2: 3, Index 3: 4, Index 4: 5
 * ```
 *
 * @example
 * Early termination:
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 *
 * forEach(numbers, (num, index) => {
 *   console.log(`Processing: ${num}`);
 *   if (num === 5) {
 *     console.log('Found 5, stopping iteration');
 *     return false; // Stop iteration
 *   }
 *   // Implicit return undefined - continues iteration
 * });
 * // Output: Processing: 1, Processing: 2, Processing: 3, Processing: 4, Processing: 5, Found 5, stopping iteration
 * ```
 *
 * @example
 * Search for first matching element:
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const users: User[] = [
 *   { id: 1, name: 'Alice', email: 'alice@example.com' },
 *   { id: 2, name: 'Bob', email: 'bob@example.com' },
 *   { id: 3, name: 'Charlie', email: 'charlie@example.com' }
 * ];
 *
 * let foundUser: User | undefined;
 * forEach(users, (user) => {
 *   if (user.name === 'Bob') {
 *     foundUser = user;
 *     return false; // Stop searching
 *   }
 * });
 * console.log(foundUser); // { id: 2, name: 'Bob', email: 'bob@example.com' }
 * ```
 *
 * @example
 * Conditional processing with early exit:
 * ```typescript
 * const tasks = ['task1', 'task2', 'error', 'task4', 'task5'];
 * const results: string[] = [];
 *
 * forEach(tasks, (task, index) => {
 *   if (task === 'error') {
 *     console.log(`Error encountered at index ${index}`);
 *     return false; // Stop processing on error
 *   }
 *   results.push(`Processed ${task}`);
 * });
 * console.log(results); // ['Processed task1', 'Processed task2']
 * ```
 *
 * @example
 * Working with complex objects:
 * ```typescript
 * interface Product {
 *   id: number;
 *   name: string;
 *   price: number;
 *   inStock: boolean;
 * }
 *
 * const products: Product[] = [
 *   { id: 1, name: 'Laptop', price: 999, inStock: true },
 *   { id: 2, name: 'Phone', price: 699, inStock: false },
 *   { id: 3, name: 'Tablet', price: 399, inStock: true }
 * ];
 *
 * let totalValue = 0;
 * forEach(products, (product, index, array) => {
 *   if (!product.inStock) {
 *     console.log(`Skipping out-of-stock item: ${product.name}`);
 *     return; // Continue to next item
 *   }
 *
 *   totalValue += product.price;
 *   console.log(`Added ${product.name} (${product.price}) - Running total: ${totalValue}`);
 *
 *   // Stop if total exceeds budget
 *   if (totalValue > 1000) {
 *     console.log('Budget exceeded, stopping calculation');
 *     return false;
 *   }
 * });
 * ```
 *
 * @example
 * Using all callback parameters:
 * ```typescript
 * const items = ['a', 'b', 'c', 'd', 'e'];
 *
 * forEach(items, (item, index, array) => {
 *   console.log(`Item: ${item}, Index: ${index}, Array length: ${array.length}`);
 *
 *   // Stop at middle element
 *   if (index >= Math.floor(array.length / 2)) {
 *     console.log('Reached middle, stopping');
 *     return false;
 *   }
 * });
 * // Output: Item: a, Index: 0, Array length: 5
 * //         Item: b, Index: 1, Array length: 5
 * //         Item: c, Index: 2, Array length: 5
 * //         Reached middle, stopping
 * ```
 *
 * @remarks
 * **Early Termination:** Iteration stops immediately when the callback returns `false`.
 * Any other return value (including `undefined`) continues the iteration.
 *
 * **Callback Parameters:** The callback function receives three parameters:
 * - `item`: The current element being processed
 * - `index`: The index of the current element
 * - `array`: The entire source array
 *
 * **Performance:** Uses simple for-loop for optimal performance. Early termination
 * can provide significant performance benefits when searching large arrays.
 *
 * **Side Effects:** This function is intended for side effects (logging, mutation, etc.)
 * rather than creating new arrays. Use `map` or `filter` for functional transformations.
 */
export const forEach = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = 0, l = array.length; i < l; i++)
    if (callback(array[i], i, array) === false) break;
};
