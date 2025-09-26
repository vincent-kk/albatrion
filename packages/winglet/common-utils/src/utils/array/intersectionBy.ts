/**
 * Returns the intersection of two arrays using a transformation function to determine equality.
 *
 * Creates a new array containing elements from the source array that have matching
 * transformed values in the target array. The mapper function is used to extract
 * comparable values from elements in both arrays for intersection comparison.
 *
 * @template Type1 - Type of the source array elements
 * @template Type2 - Type of the target array elements
 * @param source - First array to find intersection from
 * @param target - Second array to compare against
 * @param mapper - Function to transform elements into comparable values
 * @returns Array of elements from source that form the intersection with target
 *
 * @example
 * Compare objects by ID:
 * ```typescript
 * import { intersectionBy } from '@winglet/common-utils';
 *
 * const users = [
 *   { id: 1, name: 'Alice', role: 'admin' },
 *   { id: 2, name: 'Bob', role: 'user' },
 *   { id: 3, name: 'Charlie', role: 'user' }
 * ];
 *
 * const activeUsers = [
 *   { id: 1, status: 'active' },
 *   { id: 3, status: 'active' }
 * ];
 *
 * const activeUserDetails = intersectionBy(users, activeUsers, user => user.id);
 * console.log(activeUserDetails);
 * // [{ id: 1, name: 'Alice', role: 'admin' }, { id: 3, name: 'Charlie', role: 'user' }]
 * ```
 *
 * @example
 * Compare strings by length:
 * ```typescript
 * const words = ['cat', 'dog', 'elephant', 'ant', 'butterfly'];
 * const lengths = ['car', 'bus']; // length 3
 *
 * const wordsWithMatchingLength = intersectionBy(words, lengths, word => word.length);
 * console.log(wordsWithMatchingLength); // ['cat', 'dog', 'ant']
 * ```
 *
 * @example
 * Complex object intersection:
 * ```typescript
 * interface Product {
 *   id: number;
 *   name: string;
 *   category: string;
 *   price: number;
 * }
 *
 * interface Category {
 *   name: string;
 *   isActive: boolean;
 * }
 *
 * const products: Product[] = [
 *   { id: 1, name: 'Laptop', category: 'Electronics', price: 999 },
 *   { id: 2, name: 'Book', category: 'Education', price: 29 },
 *   { id: 3, name: 'Phone', category: 'Electronics', price: 699 }
 * ];
 *
 * const activeCategories: Category[] = [
 *   { name: 'Electronics', isActive: true },
 *   { name: 'Sports', isActive: true }
 * ];
 *
 * // Find products in active categories
 * const activeProducts = intersectionBy(
 *   products,
 *   activeCategories,
 *   item => 'category' in item ? item.category : item.name
 * );
 * console.log(activeProducts); // [{ id: 1, name: 'Laptop', ... }, { id: 3, name: 'Phone', ... }]
 * ```
 *
 * @example
 * Date-based intersection:
 * ```typescript
 * const events = [
 *   { name: 'Meeting', date: new Date('2024-01-15') },
 *   { name: 'Conference', date: new Date('2024-02-20') },
 *   { name: 'Workshop', date: new Date('2024-03-10') }
 * ];
 *
 * const holidays = [
 *   { name: 'Presidents Day', date: new Date('2024-02-20') },
 *   { name: 'Memorial Day', date: new Date('2024-05-27') }
 * ];
 *
 * // Find events that fall on holidays
 * const conflictingEvents = intersectionBy(
 *   events,
 *   holidays,
 *   item => item.date.getTime()
 * );
 * console.log(conflictingEvents); // [{ name: 'Conference', date: ... }]
 * ```
 *
 * @example
 * Nested property comparison:
 * ```typescript
 * const employees = [
 *   { id: 1, profile: { department: 'Engineering', level: 'Senior' } },
 *   { id: 2, profile: { department: 'Marketing', level: 'Junior' } },
 *   { id: 3, profile: { department: 'Engineering', level: 'Junior' } }
 * ];
 *
 * const departments = [
 *   { name: 'Engineering', budget: 100000 },
 *   { name: 'Sales', budget: 80000 }
 * ];
 *
 * const engineeringEmployees = intersectionBy(
 *   employees,
 *   departments,
 *   item => 'profile' in item ? item.profile.department : item.name
 * );
 * console.log(engineeringEmployees);
 * // [{ id: 1, profile: { department: 'Engineering', ... } }, { id: 3, profile: { department: 'Engineering', ... } }]
 * ```
 *
 * @example
 * Email domain intersection:
 * ```typescript
 * const users = [
 *   { name: 'Alice', email: 'alice@company.com' },
 *   { name: 'Bob', email: 'bob@gmail.com' },
 *   { name: 'Charlie', email: 'charlie@company.com' }
 * ];
 *
 * const allowedDomains = ['company.com', 'partner.org'];
 *
 * const companyUsers = intersectionBy(
 *   users,
 *   allowedDomains,
 *   item => typeof item === 'string' ? item : item.email.split('@')[1]
 * );
 * console.log(companyUsers);
 * // [{ name: 'Alice', email: 'alice@company.com' }, { name: 'Charlie', email: 'charlie@company.com' }]
 * ```
 *
 * @example
 * Working with different types:
 * ```typescript
 * interface Person { name: string; age: number; }
 * interface AgeGroup { min: number; max: number; }
 *
 * const people: Person[] = [
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob', age: 35 },
 *   { name: 'Charlie', age: 45 }
 * ];
 *
 * const targetAges = [25, 35, 55];
 *
 * const matchingAgePeople = intersectionBy(
 *   people,
 *   targetAges,
 *   item => typeof item === 'number' ? item : item.age
 * );
 * console.log(matchingAgePeople); // [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 35 }]
 * ```
 *
 * @remarks
 * **Performance:** Uses Set for O(1) average case lookup after mapping target array.
 * Time complexity is O(n + m) where n is source length and m is target length.
 *
 * **Mapper Function:** The mapper function is called once for each element in both arrays.
 * Ensure the mapper function is pure and returns consistent values for the same input.
 *
 * **Type Safety:** Supports different types for source and target arrays as long as
 * the mapper function can handle both types and returns comparable values.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 *
 * **Duplicate Handling:** If the source array contains elements that map to the same value
 * and that value exists in the mapped target array, all matching elements from source
 * will be included in the result.
 */
export const intersectionBy = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const targetSet = new Set<unknown>();
  for (let i = 0, e = target[0], l = target.length; i < l; i++, e = target[i])
    targetSet.add(mapper(e));

  const result: Type1[] = [];
  for (let i = 0, e = source[0], l = source.length; i < l; i++, e = source[i]) {
    if (targetSet.has(mapper(e))) result[result.length] = e;
  }
  return result;
};
