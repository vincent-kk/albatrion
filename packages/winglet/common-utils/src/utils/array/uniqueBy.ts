/**
 * Removes duplicate elements from an array using a transformation function to determine uniqueness.
 *
 * Creates a new array containing elements where no two elements produce the same
 * value when passed through the mapper function. Only the first occurrence of
 * elements with the same mapped value is retained. Uses Map for efficient
 * duplicate detection based on transformed values.
 *
 * @template Type - Type of array elements
 * @template SubType - Type of comparison value returned by mapper
 * @param source - Source array to remove duplicates from
 * @param mapper - Function to extract comparison value from elements
 * @returns Array with duplicates removed based on mapped values
 *
 * @example
 * Remove duplicate objects by ID:
 * ```typescript
 * import { uniqueBy } from '@winglet/common-utils';
 *
 * const users = [
 *   { id: 1, name: 'Alice', email: 'alice@example.com' },
 *   { id: 2, name: 'Bob', email: 'bob@example.com' },
 *   { id: 1, name: 'Alice Updated', email: 'alice.new@example.com' },
 *   { id: 3, name: 'Charlie', email: 'charlie@example.com' },
 *   { id: 2, name: 'Bob Smith', email: 'bob.smith@example.com' }
 * ];
 *
 * const uniqueUsers = uniqueBy(users, user => user.id);
 * console.log(uniqueUsers);
 * // [
 * //   { id: 1, name: 'Alice', email: 'alice@example.com' },
 * //   { id: 2, name: 'Bob', email: 'bob@example.com' },
 * //   { id: 3, name: 'Charlie', email: 'charlie@example.com' }
 * // ]
 * // Note: First occurrence of each ID is kept
 * ```
 *
 * @example
 * Remove duplicate strings by length:
 * ```typescript
 * const words = ['cat', 'dog', 'elephant', 'ant', 'butterfly', 'ox'];
 * const uniqueByLength = uniqueBy(words, word => word.length);
 * console.log(uniqueByLength); // ['cat', 'elephant', 'butterfly']
 * // Keeps first word of each unique length: 3, 8, 9
 * ```
 *
 * @example
 * Remove duplicate emails by domain:
 * ```typescript
 * const emails = [
 *   'alice@company.com',
 *   'bob@gmail.com',
 *   'charlie@company.com',
 *   'diana@yahoo.com',
 *   'eve@gmail.com'
 * ];
 *
 * const uniqueByDomain = uniqueBy(emails, email => email.split('@')[1]);
 * console.log(uniqueByDomain);
 * // ['alice@company.com', 'bob@gmail.com', 'diana@yahoo.com']
 * // First email from each domain
 * ```
 *
 * @example
 * Complex object deduplication:
 * ```typescript
 * interface Product {
 *   id: number;
 *   name: string;
 *   category: string;
 *   price: number;
 *   variant: string;
 * }
 *
 * const products: Product[] = [
 *   { id: 1, name: 'iPhone', category: 'Electronics', price: 999, variant: 'red' },
 *   { id: 2, name: 'MacBook', category: 'Electronics', price: 1299, variant: 'silver' },
 *   { id: 3, name: 'iPhone', category: 'Electronics', price: 899, variant: 'blue' },
 *   { id: 4, name: 'iPad', category: 'Electronics', price: 799, variant: 'gold' }
 * ];
 *
 * // Remove duplicates by product name
 * const uniqueByName = uniqueBy(products, product => product.name);
 * console.log(uniqueByName);
 * // [
 * //   { id: 1, name: 'iPhone', ... },
 * //   { id: 2, name: 'MacBook', ... },
 * //   { id: 4, name: 'iPad', ... }
 * // ]
 *
 * // Remove duplicates by category
 * const uniqueByCategory = uniqueBy(products, product => product.category);
 * console.log(uniqueByCategory); // [{ id: 1, name: 'iPhone', ... }]
 * ```
 *
 * @example
 * Nested property deduplication:
 * ```typescript
 * interface Employee {
 *   id: number;
 *   name: string;
 *   department: {
 *     id: number;
 *     name: string;
 *   };
 * }
 *
 * const employees: Employee[] = [
 *   { id: 1, name: 'Alice', department: { id: 10, name: 'Engineering' } },
 *   { id: 2, name: 'Bob', department: { id: 20, name: 'Marketing' } },
 *   { id: 3, name: 'Charlie', department: { id: 10, name: 'Engineering' } },
 *   { id: 4, name: 'Diana', department: { id: 30, name: 'Sales' } }
 * ];
 *
 * const uniqueByDepartment = uniqueBy(employees, emp => emp.department.id);
 * console.log(uniqueByDepartment);
 * // [
 * //   { id: 1, name: 'Alice', department: { id: 10, name: 'Engineering' } },
 * //   { id: 2, name: 'Bob', department: { id: 20, name: 'Marketing' } },
 * //   { id: 4, name: 'Diana', department: { id: 30, name: 'Sales' } }
 * // ]
 * ```
 *
 * @example
 * Date-based deduplication:
 * ```typescript
 * interface Event {
 *   id: number;
 *   name: string;
 *   date: Date;
 * }
 *
 * const events: Event[] = [
 *   { id: 1, name: 'Meeting', date: new Date('2024-01-15T10:00:00Z') },
 *   { id: 2, name: 'Conference', date: new Date('2024-01-15T14:00:00Z') },
 *   { id: 3, name: 'Workshop', date: new Date('2024-01-16T09:00:00Z') },
 *   { id: 4, name: 'Training', date: new Date('2024-01-15T16:00:00Z') }
 * ];
 *
 * // Remove duplicates by date (ignoring time)
 * const uniqueByDate = uniqueBy(events, event => event.date.toDateString());
 * console.log(uniqueByDate);
 * // [
 * //   { id: 1, name: 'Meeting', date: ... }, // Jan 15
 * //   { id: 3, name: 'Workshop', date: ... }  // Jan 16
 * // ]
 * ```
 *
 * @example
 * Numeric transformation:
 * ```typescript
 * const numbers = [1.1, 1.9, 2.1, 2.8, 3.2, 3.7];
 *
 * // Remove duplicates by integer part
 * const uniqueByFloor = uniqueBy(numbers, num => Math.floor(num));
 * console.log(uniqueByFloor); // [1.1, 2.1, 3.2]
 *
 * // Remove duplicates by rounded value
 * const uniqueByRound = uniqueBy(numbers, num => Math.round(num));
 * console.log(uniqueByRound); // [1.1, 2.1, 3.2]
 * ```
 *
 * @example
 * String transformation:
 * ```typescript
 * const names = ['Alice', 'ALICE', 'Bob', 'bob', 'Charlie', 'charlie'];
 *
 * // Case-insensitive deduplication
 * const uniqueByLowerCase = uniqueBy(names, name => name.toLowerCase());
 * console.log(uniqueByLowerCase); // ['Alice', 'Bob', 'Charlie']
 *
 * // Deduplication by first character
 * const uniqueByFirstChar = uniqueBy(names, name => name[0].toLowerCase());
 * console.log(uniqueByFirstChar); // ['Alice', 'Bob', 'Charlie']
 * ```
 *
 * @example
 * Complex key generation:
 * ```typescript
 * interface Order {
 *   id: number;
 *   customerId: number;
 *   productId: number;
 *   quantity: number;
 * }
 *
 * const orders: Order[] = [
 *   { id: 1, customerId: 100, productId: 1, quantity: 2 },
 *   { id: 2, customerId: 101, productId: 2, quantity: 1 },
 *   { id: 3, customerId: 100, productId: 1, quantity: 3 }, // Same customer + product
 *   { id: 4, customerId: 102, productId: 1, quantity: 1 }
 * ];
 *
 * // Remove duplicate customer-product combinations
 * const uniqueCustomerProduct = uniqueBy(
 *   orders,
 *   order => `${order.customerId}-${order.productId}`
 * );
 * console.log(uniqueCustomerProduct);
 * // [
 * //   { id: 1, customerId: 100, productId: 1, quantity: 2 },
 * //   { id: 2, customerId: 101, productId: 2, quantity: 1 },
 * //   { id: 4, customerId: 102, productId: 1, quantity: 1 }
 * // ]
 * ```
 *
 * @remarks
 * **Performance:** Uses Map for O(1) average case lookup of mapped values.
 * Time complexity is O(n) where n is the array length.
 *
 * **Mapper Function:** The mapper function is called once for each element.
 * Ensure the mapper function is pure and returns consistent values for the same input.
 *
 * **First Occurrence:** When multiple elements map to the same value, only the
 * first occurrence is retained in the result array.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 *
 * **Map Storage:** Uses Map to store the first occurrence of each unique mapped value,
 * providing efficient lookup and maintaining insertion order.
 */
export const uniqueBy = <Type, SubType>(
  source: Type[],
  mapper: (item: Type) => SubType,
): Type[] => {
  const map = new Map<SubType, Type>();
  for (let i = 0, e = source[0], l = source.length; i < l; i++, e = source[i]) {
    const key = mapper(e);
    if (!map.has(key)) map.set(key, e);
  }
  return Array.from(map.values());
};
