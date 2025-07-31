/**
 * Executes a callback function for each element in an array in reverse order with early termination support.
 *
 * Iterates through the array from the last element to the first, executing the provided
 * callback function for each element. If the callback returns `false`, the iteration 
 * stops immediately. This is useful for operations that need to process elements in 
 * reverse order or when searching backwards through an array.
 *
 * @template Type - Type of array elements
 * @param array - Array to iterate over in reverse
 * @param callback - Callback function to execute for each element
 *
 * @example
 * Basic reverse iteration:
 * ```typescript
 * import { forEachReverse } from '@winglet/common-utils';
 *
 * const numbers = [1, 2, 3, 4, 5];
 * forEachReverse(numbers, (num, index) => {
 *   console.log(`Index ${index}: ${num}`);
 * });
 * // Output: Index 4: 5, Index 3: 4, Index 2: 3, Index 1: 2, Index 0: 1
 * ```
 *
 * @example
 * Early termination while searching backwards:
 * ```typescript
 * const logs = [
 *   'INFO: Application started',
 *   'DEBUG: Loading config',
 *   'ERROR: Database connection failed',
 *   'INFO: Retrying connection',
 *   'INFO: Connection successful'
 * ];
 *
 * let lastError: string | undefined;
 * forEachReverse(logs, (log, index) => {
 *   console.log(`Checking log at index ${index}: ${log}`);
 *   if (log.startsWith('ERROR:')) {
 *     lastError = log;
 *     console.log('Found last error, stopping search');
 *     return false; // Stop iteration
 *   }
 * });
 * console.log('Last error:', lastError);
 * // Output: Checking log at index 4: INFO: Connection successful
 * //         Checking log at index 3: INFO: Retrying connection
 * //         Checking log at index 2: ERROR: Database connection failed
 * //         Found last error, stopping search
 * //         Last error: ERROR: Database connection failed
 * ```
 *
 * @example
 * Reverse processing of user actions:
 * ```typescript
 * interface Action {
 *   id: number;
 *   type: 'CREATE' | 'UPDATE' | 'DELETE';
 *   timestamp: Date;
 *   data: any;
 * }
 *
 * const actions: Action[] = [
 *   { id: 1, type: 'CREATE', timestamp: new Date('2024-01-01T10:00:00Z'), data: { name: 'Item1' } },
 *   { id: 2, type: 'UPDATE', timestamp: new Date('2024-01-01T11:00:00Z'), data: { name: 'Item1 Updated' } },
 *   { id: 3, type: 'DELETE', timestamp: new Date('2024-01-01T12:00:00Z'), data: { id: 1 } }
 * ];
 *
 * // Process actions in reverse chronological order (undo operations)
 * forEachReverse(actions, (action, index) => {
 *   console.log(`Undoing action ${action.id}: ${action.type} at ${action.timestamp.toISOString()}`);
 *   
 *   // Stop undoing if we reach a CREATE action
 *   if (action.type === 'CREATE') {
 *     console.log('Reached initial CREATE action, stopping undo');
 *     return false;
 *   }
 * });
 * ```
 *
 * @example
 * Finding the last valid item:
 * ```typescript
 * interface Product {
 *   id: number;
 *   name: string;
 *   price: number;
 *   isValid: boolean;
 * }
 *
 * const products: Product[] = [
 *   { id: 1, name: 'Laptop', price: 999, isValid: true },
 *   { id: 2, name: 'Phone', price: -100, isValid: false }, // Invalid price
 *   { id: 3, name: 'Tablet', price: 399, isValid: true },
 *   { id: 4, name: 'Watch', price: 0, isValid: false } // Invalid price
 * ];
 *
 * let lastValidProduct: Product | undefined;
 * forEachReverse(products, (product, index, array) => {
 *   if (product.isValid && product.price > 0) {
 *     lastValidProduct = product;
 *     console.log(`Found last valid product at index ${index}: ${product.name}`);
 *     return false; // Stop searching
 *   }
 *   console.log(`Skipping invalid product at index ${index}: ${product.name}`);
 * });
 * console.log('Last valid product:', lastValidProduct);
 * ```
 *
 * @example
 * Reverse array traversal with conditions:
 * ```typescript
 * const scores = [85, 92, 78, 95, 88, 91, 87];
 * const passingGrade = 90;
 * let consecutivePassing = 0;
 *
 * forEachReverse(scores, (score, index) => {
 *   console.log(`Checking score at index ${index}: ${score}`);
 *   
 *   if (score >= passingGrade) {
 *     consecutivePassing++;
 *     console.log(`Passing grade found. Consecutive count: ${consecutivePassing}`);
 *   } else {
 *     if (consecutivePassing > 0) {
 *       console.log(`Non-passing grade found. Final consecutive count: ${consecutivePassing}`);
 *       return false; // Stop counting
 *     }
 *   }
 * });
 * console.log(`Final consecutive passing scores from end: ${consecutivePassing}`);
 * ```
 *
 * @example
 * Stack-like processing:
 * ```typescript
 * const operations = ['push(1)', 'push(2)', 'push(3)', 'pop()', 'push(4)', 'pop()'];
 * const stack: number[] = [];
 *
 * // Process operations in reverse to simulate undo
 * forEachReverse(operations, (operation, index) => {
 *   console.log(`Undoing operation ${index}: ${operation}`);
 *   
 *   if (operation.startsWith('push')) {
 *     // Undo push by removing the element
 *     const value = parseInt(operation.match(/\d+/)?.[0] || '0');
 *     const removedIndex = stack.indexOf(value);
 *     if (removedIndex !== -1) {
 *       stack.splice(removedIndex, 1);
 *       console.log(`Removed ${value} from stack`);
 *     }
 *   } else if (operation === 'pop()') {
 *     // Undo pop by adding back (this is simplified)
 *     console.log('Would restore popped element');
 *   }
 *   
 *   console.log('Current stack:', stack);
 * });
 * ```
 *
 * @remarks
 * **Reverse Order:** Starts from the last element (index `array.length - 1`) and
 * moves backwards to the first element (index `0`).
 *
 * **Early Termination:** Iteration stops immediately when the callback returns `false`.
 * Any other return value (including `undefined`) continues the iteration.
 *
 * **Callback Parameters:** The callback function receives three parameters:
 * - `item`: The current element being processed
 * - `index`: The current index (original index in the array)
 * - `array`: The entire source array
 *
 * **Performance:** Uses a simple reverse for-loop for optimal performance with
 * minimal overhead. Early termination can provide significant performance benefits
 * when searching large arrays.
 *
 * **Use Cases:** Ideal for undo operations, finding the last occurrence of something,
 * processing data in LIFO (Last In, First Out) order, or any scenario where reverse
 * iteration provides logical or performance advantages.
 */
export const forEachReverse = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = array.length - 1; i >= 0; i--)
    if (callback(array[i], i, array) === false) break;
};
