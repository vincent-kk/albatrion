/**
 * Creates a new array with elements that pass the test implemented by the provided callback function.
 *
 * Iterates through each element of the source array and includes only those elements
 * for which the callback function returns a truthy value. The callback receives
 * the current element, its index, and the entire array as arguments.
 *
 * @template Type - Type of input array elements
 * @param array - Source array to filter
 * @param callback - Filtering function to test each element
 * @returns New filtered array containing only elements that pass the test
 *
 * @example
 * Filter numbers by condition:
 * ```typescript
 * import { filter } from '@winglet/common-utils';
 *
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const evens = filter(numbers, num => num % 2 === 0);
 * console.log(evens); // [2, 4, 6, 8, 10]
 *
 * const greaterThanFive = filter(numbers, num => num > 5);
 * console.log(greaterThanFive); // [6, 7, 8, 9, 10]
 * ```
 *
 * @example
 * Filter objects by property:
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 * }
 *
 * const users: User[] = [
 *   { id: 1, name: 'Alice', age: 30, isActive: true },
 *   { id: 2, name: 'Bob', age: 25, isActive: false },
 *   { id: 3, name: 'Charlie', age: 35, isActive: true },
 *   { id: 4, name: 'Diana', age: 28, isActive: false }
 * ];
 *
 * const activeUsers = filter(users, user => user.isActive);
 * console.log(activeUsers); // [{ id: 1, name: 'Alice', ... }, { id: 3, name: 'Charlie', ... }]
 *
 * const adultsOver30 = filter(users, user => user.age > 30);
 * console.log(adultsOver30); // [{ id: 3, name: 'Charlie', age: 35, ... }]
 * ```
 *
 * @example
 * Using index and array parameters:
 * ```typescript
 * const items = ['a', 'b', 'c', 'd', 'e'];
 *
 * // Filter by index (get every other element)
 * const everyOther = filter(items, (item, index) => index % 2 === 0);
 * console.log(everyOther); // ['a', 'c', 'e']
 *
 * // Filter based on array context
 * const duplicatesRemoved = filter(items, (item, index, array) => 
 *   array.indexOf(item) === index
 * );
 * ```
 *
 * @example
 * Filter strings by criteria:
 * ```typescript
 * const words = ['apple', 'banana', 'apricot', 'cherry', 'avocado'];
 *
 * // Filter by starting letter
 * const startsWithA = filter(words, word => word.startsWith('a'));
 * console.log(startsWithA); // ['apple', 'apricot', 'avocado']
 *
 * // Filter by length
 * const longWords = filter(words, word => word.length > 5);
 * console.log(longWords); // ['banana', 'apricot', 'cherry', 'avocado']
 * ```
 *
 * @example
 * Complex filtering with multiple conditions:
 * ```typescript
 * interface Product {
 *   name: string;
 *   price: number;
 *   category: string;
 *   inStock: boolean;
 * }
 *
 * const products: Product[] = [
 *   { name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
 *   { name: 'Book', price: 15, category: 'Education', inStock: true },
 *   { name: 'Phone', price: 699, category: 'Electronics', inStock: false },
 *   { name: 'Desk', price: 299, category: 'Furniture', inStock: true }
 * ];
 *
 * // Filter expensive electronics in stock
 * const expensiveElectronics = filter(products, product => 
 *   product.category === 'Electronics' && 
 *   product.price > 500 && 
 *   product.inStock
 * );
 * console.log(expensiveElectronics); // [{ name: 'Laptop', ... }]
 * ```
 *
 * @example
 * Working with nested objects:
 * ```typescript
 * const employees = [
 *   { name: 'John', skills: ['JavaScript', 'Python'], department: { name: 'Engineering' } },
 *   { name: 'Jane', skills: ['Java', 'C++'], department: { name: 'Engineering' } },
 *   { name: 'Bob', skills: ['Marketing', 'Sales'], department: { name: 'Sales' } }
 * ];
 *
 * // Filter engineers with JavaScript skills
 * const jsEngineers = filter(employees, emp => 
 *   emp.department.name === 'Engineering' && 
 *   emp.skills.includes('JavaScript')
 * );
 * console.log(jsEngineers); // [{ name: 'John', ... }]
 * ```
 *
 * @remarks
 * **Performance:** Uses dynamic array growth with direct index assignment for optimal
 * performance. Time complexity is O(n) where n is the array length.
 *
 * **Callback Parameters:** The callback function receives three parameters:
 * - `item`: The current element being processed
 * - `index`: The index of the current element
 * - `array`: The entire source array
 *
 * **Immutability:** Does not modify the original array, returns a new filtered array.
 *
 * **Truthy Values:** Elements are included if the callback returns any truthy value,
 * not just boolean `true`.
 */
export const filter = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean,
): Type[] => {
  const result = new Array<Type>();
  for (let index = 0; index < array.length; index++)
    if (callback(array[index], index, array))
      result[result.length] = array[index];
  return result;
};
