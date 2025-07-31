/**
 * Groups array elements by a computed key for efficient data organization.
 *
 * Transforms an array into a grouped object structure based on a key extraction
 * function, enabling efficient data categorization, filtering, and analysis.
 * Maintains original element order within each group.
 *
 * @template Type - Type of array elements
 * @template Key - Type of grouping key (string, number, or symbol)
 * @param array - Array to group by key
 * @param getKey - Function to extract grouping key from each element
 * @returns Object with keys as group identifiers and values as element arrays
 *
 * @example
 * Group by property:
 * ```typescript
 * import { groupBy } from '@winglet/common-utils';
 *
 * interface Person {
 *   name: string;
 *   age: number;
 *   department: string;
 * }
 *
 * const employees: Person[] = [
 *   { name: 'Alice', age: 30, department: 'Engineering' },
 *   { name: 'Bob', age: 25, department: 'Marketing' },
 *   { name: 'Charlie', age: 35, department: 'Engineering' },
 *   { name: 'Diana', age: 28, department: 'Marketing' }
 * ];
 *
 * const byDepartment = groupBy(employees, person => person.department);
 * console.log(byDepartment);
 * // {
 * //   Engineering: [{ name: 'Alice', ... }, { name: 'Charlie', ... }],
 * //   Marketing: [{ name: 'Bob', ... }, { name: 'Diana', ... }]
 * // }
 * ```
 *
 * @example
 * Group by computed value:
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 *
 * // Group by even/odd
 * const byEvenOdd = groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd');
 * console.log(byEvenOdd);
 * // { odd: [1, 3, 5, 7, 9], even: [2, 4, 6, 8, 10] }
 *
 * // Group by range
 * const byRange = groupBy(numbers, n => {
 *   if (n <= 3) return 'low';
 *   if (n <= 7) return 'medium';
 *   return 'high';
 * });
 * console.log(byRange);
 * // { low: [1, 2, 3], medium: [4, 5, 6, 7], high: [8, 9, 10] }
 * ```
 *
 * @example
 * Data analysis patterns:
 * ```typescript
 * interface Sale {
 *   id: string;
 *   amount: number;
 *   date: string;
 *   region: string;
 * }
 *
 * const sales: Sale[] = [
 *   { id: '1', amount: 150, date: '2024-01', region: 'North' },
 *   { id: '2', amount: 200, date: '2024-01', region: 'South' },
 *   { id: '3', amount: 300, date: '2024-02', region: 'North' }
 * ];
 *
 * // Group by month for trend analysis
 * const byMonth = groupBy(sales, sale => sale.date.substring(0, 7));
 *
 * // Group by region for regional analysis
 * const byRegion = groupBy(sales, sale => sale.region);
 *
 * // Group by amount range for distribution analysis
 * const byAmountRange = groupBy(sales, sale => {
 *   if (sale.amount < 100) return 'small';
 *   if (sale.amount < 1000) return 'medium';
 *   return 'large';
 * });
 * ```
 *
 * @example
 * Advanced grouping scenarios:
 * ```typescript
 * // Group by string length
 * const words = ['apple', 'banana', 'cat', 'dog', 'elephant'];
 * const byLength = groupBy(words, word => word.length);
 * // { 3: ['cat', 'dog'], 5: ['apple'], 6: ['banana'], 8: ['elephant'] }
 *
 * // Group by first character
 * const byFirstChar = groupBy(words, word => word[0]);
 * // { a: ['apple'], b: ['banana'], c: ['cat'], d: ['dog'], e: ['elephant'] }
 *
 * // Group by nested property
 * const users = [
 *   { profile: { role: 'admin' }, id: 1 },
 *   { profile: { role: 'user' }, id: 2 },
 *   { profile: { role: 'admin' }, id: 3 }
 * ];
 * const byRole = groupBy(users, user => user.profile.role);
 * // { admin: [{ profile: { role: 'admin' }, id: 1 }, ...], user: [...] }
 * ```
 *
 * @remarks
 * **Performance:** Uses object property assignment for O(1) average case
 * grouping operations. Total complexity is O(n) where n is array length.
 *
 * **Key Types:** Supports string, number, and symbol keys through PropertyKey
 * constraint, enabling flexible grouping strategies.
 *
 * **Empty Arrays:** Returns an empty object when given an empty array,
 * maintaining consistent behavior.
 *
 * **Order Preservation:** Elements within each group maintain their original
 * order from the source array.
 */
export const groupBy = <Type, Key extends PropertyKey>(
  array: Type[],
  getKey: (item: Type) => Key,
): Record<Key, Type[]> => {
  const result = {} as Record<Key, Type[]>;
  for (let i = 0, l = array.length; i < l; i++) {
    const item = array[i];
    const key = getKey(item);
    if (key in result) result[key].push(item);
    else result[key] = [item];
  }
  return result;
};
