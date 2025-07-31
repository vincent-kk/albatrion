/**
 * Returns the intersection of two arrays using a custom comparison function to determine equality.
 *
 * Creates a new array containing elements from the source array that have matching
 * elements in the target array based on a custom equality comparison. This is useful
 * when you need complex comparison logic that cannot be expressed with simple
 * value transformation.
 *
 * @template Type1 - Type of the source array elements
 * @template Type2 - Type of the target array elements
 * @param source - First array to find intersection from
 * @param target - Second array to compare against
 * @param isEqual - Element comparison function to determine equality
 * @returns Array of elements from source that form the intersection with target
 *
 * @example
 * Compare objects with custom logic:
 * ```typescript
 * import { intersectionWith } from '@winglet/common-utils';
 *
 * const products = [
 *   { id: 1, name: 'iPhone', price: 999 },
 *   { id: 2, name: 'iPad', price: 799 },
 *   { id: 3, name: 'MacBook', price: 1299 }
 * ];
 *
 * const wishlist = [
 *   { id: 1, name: 'iPhone', maxPrice: 1000 },
 *   { id: 4, name: 'Watch', maxPrice: 400 }
 * ];
 *
 * // Find products that match wishlist items by name and are within budget
 * const affordableWishlistItems = intersectionWith(
 *   products,
 *   wishlist,
 *   (product, wish) => product.name === wish.name && product.price <= wish.maxPrice
 * );
 * console.log(affordableWishlistItems); // [{ id: 1, name: 'iPhone', price: 999 }]
 * ```
 *
 * @example
 * Case-insensitive string comparison:
 * ```typescript
 * const availableItems = ['Apple', 'Banana', 'Orange', 'Grape'];
 * const requestedItems = ['apple', 'BANANA', 'kiwi'];
 *
 * const matchingItems = intersectionWith(
 *   availableItems,
 *   requestedItems,
 *   (available, requested) => available.toLowerCase() === requested.toLowerCase()
 * );
 * console.log(matchingItems); // ['Apple', 'Banana']
 * ```
 *
 * @example
 * Complex object intersection with multiple criteria:
 * ```typescript
 * interface Employee {
 *   id: number;
 *   name: string;
 *   department: string;
 *   skills: string[];
 * }
 *
 * interface JobRequirement {
 *   department: string;
 *   requiredSkills: string[];
 *   minSkillCount: number;
 * }
 *
 * const employees: Employee[] = [
 *   { id: 1, name: 'Alice', department: 'Engineering', skills: ['JavaScript', 'Python', 'React'] },
 *   { id: 2, name: 'Bob', department: 'Engineering', skills: ['Java', 'Spring'] },
 *   { id: 3, name: 'Charlie', department: 'Marketing', skills: ['SEO', 'Analytics'] }
 * ];
 *
 * const jobRequirements: JobRequirement[] = [
 *   { department: 'Engineering', requiredSkills: ['JavaScript', 'React'], minSkillCount: 2 }
 * ];
 *
 * const qualifiedEmployees = intersectionWith(
 *   employees,
 *   jobRequirements,
 *   (emp, req) => {
 *     if (emp.department !== req.department) return false;
 *     const matchingSkills = emp.skills.filter(skill => req.requiredSkills.includes(skill));
 *     return matchingSkills.length >= req.minSkillCount;
 *   }
 * );
 * console.log(qualifiedEmployees); // [{ id: 1, name: 'Alice', ... }]
 * ```
 *
 * @example
 * Approximate numeric comparison:
 * ```typescript
 * const measurements = [1.05, 2.48, 3.72, 4.91, 5.15];
 * const targets = [1.0, 2.5, 5.2];
 *
 * const closeMatches = intersectionWith(
 *   measurements,
 *   targets,
 *   (measurement, target) => Math.abs(measurement - target) < 0.1
 * );
 * console.log(closeMatches); // [1.05, 5.15]
 * ```
 *
 * @example
 * Coordinate intersection within tolerance:
 * ```typescript
 * interface Point { x: number; y: number; }
 *
 * const points: Point[] = [
 *   { x: 1, y: 2 },
 *   { x: 3, y: 4 },
 *   { x: 5, y: 6 }
 * ];
 *
 * const targets: Point[] = [
 *   { x: 1.1, y: 2.1 },
 *   { x: 7, y: 8 }
 * ];
 *
 * const nearbyPoints = intersectionWith(
 *   points,
 *   targets,
 *   (point, target) => {
 *     const distance = Math.sqrt(
 *       Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
 *     );
 *     return distance < 0.5;
 *   }
 * );
 * console.log(nearbyPoints); // [{ x: 1, y: 2 }]
 * ```
 *
 * @example
 * Date range intersection:
 * ```typescript
 * interface Event {
 *   name: string;
 *   startDate: Date;
 *   endDate: Date;
 * }
 *
 * interface TimeSlot {
 *   start: Date;
 *   end: Date;
 * }
 *
 * const events: Event[] = [
 *   { name: 'Conference', startDate: new Date('2024-01-10'), endDate: new Date('2024-01-12') },
 *   { name: 'Workshop', startDate: new Date('2024-01-15'), endDate: new Date('2024-01-16') },
 *   { name: 'Meeting', startDate: new Date('2024-01-20'), endDate: new Date('2024-01-20') }
 * ];
 *
 * const availableSlots: TimeSlot[] = [
 *   { start: new Date('2024-01-11'), end: new Date('2024-01-13') },
 *   { start: new Date('2024-01-19'), end: new Date('2024-01-21') }
 * ];
 *
 * // Find events that overlap with available time slots
 * const overlappingEvents = intersectionWith(
 *   events,
 *   availableSlots,
 *   (event, slot) => event.startDate <= slot.end && event.endDate >= slot.start
 * );
 * console.log(overlappingEvents); // [{ name: 'Conference', ... }, { name: 'Meeting', ... }]
 * ```
 *
 * @example
 * Pattern matching:
 * ```typescript
 * const emails = [
 *   'user@company.com',
 *   'admin@company.com',
 *   'guest@external.org',
 *   'support@company.com'
 * ];
 *
 * const patterns = [/.*@company\.com$/, /admin.*\/];
 *
 * const matchingEmails = intersectionWith(
 *   emails,
 *   patterns,
 *   (email, pattern) => pattern.test(email)
 * );
 * console.log(matchingEmails); // ['user@company.com', 'admin@company.com', 'support@company.com']
 * ```
 *
 * @remarks
 * **Performance:** Uses nested loops with O(n×m) time complexity where n is source length
 * and m is target length. Consider using `intersectionBy` with a hash function for large arrays.
 *
 * **Comparison Function:** The `isEqual` function should be pure and can be asymmetric.
 * It receives elements from source as first parameter and target as second parameter.
 *
 * **Type Safety:** Supports different types for source and target arrays as long as
 * the comparison function can handle both types.
 *
 * **Order Preservation:** Maintains the original order of elements from the source array
 * in the result array.
 *
 * **Early Exit:** For each source element, stops checking target elements once a match is found,
 * providing some optimization for cases where matches are found early.
 */
export const intersectionWith = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  isEqual: (source: Type1, target: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    for (let j = 0; j < target.length; j++) {
      if (isEqual(item, target[j])) {
        result[result.length] = item;
        break;
      }
    }
  }
  return result;
};
