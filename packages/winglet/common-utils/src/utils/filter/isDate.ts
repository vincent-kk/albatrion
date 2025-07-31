/**
 * Determines whether a value is a Date object with enhanced type safety.
 *
 * Provides reliable Date object detection using instanceof check for
 * identifying JavaScript Date instances, regardless of how they were
 * created or their validity state.
 *
 * @param value - Value to test for Date type
 * @returns Type-safe boolean indicating whether the value is a Date object
 *
 * @example
 * Basic Date detection:
 * ```typescript
 * import { isDate } from '@winglet/common-utils';
 *
 * // True cases - Date objects
 * console.log(isDate(new Date())); // true
 * console.log(isDate(new Date('2023-01-01'))); // true
 * console.log(isDate(new Date(0))); // true (Unix epoch)
 * console.log(isDate(new Date('invalid'))); // true (invalid Date is still Date)
 * 
 * // False cases - not Date objects
 * console.log(isDate('2023-01-01')); // false (date string)
 * console.log(isDate(1640995200000)); // false (timestamp number)
 * console.log(isDate(Date.now())); // false (number, not Date)
 * console.log(isDate('January 1, 2023')); // false (string)
 * console.log(isDate(null)); // false
 * console.log(isDate(undefined)); // false
 * console.log(isDate({})); // false
 * ```
 *
 * @example
 * Date validation and processing:
 * ```typescript
 * function processDateValue(value: unknown): string {
 *   if (isDate(value)) {
 *     // TypeScript knows value is Date
 *     if (isNaN(value.getTime())) {
 *       return 'Invalid Date';
 *     }
 *     
 *     return value.toISOString();
 *   }
 *   
 *   // Try to convert other types to Date
 *   const date = new Date(value as any);
 *   return isNaN(date.getTime()) ? 'Cannot convert to Date' : date.toISOString();
 * }
 *
 * // Usage
 * console.log(processDateValue(new Date())); // "2023-07-31T10:30:00.000Z"
 * console.log(processDateValue('2023-01-01')); // "2023-01-01T00:00:00.000Z"
 * console.log(processDateValue('invalid')); // "Cannot convert to Date"
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface UserData {
 *   name: string;
 *   createdAt: unknown;
 *   updatedAt: unknown;
 * }
 *
 * function validateUserData(data: UserData) {
 *   const errors: string[] = [];
 *   
 *   if (!isDate(data.createdAt)) {
 *     errors.push('createdAt must be a Date object');
 *   } else if (isNaN(data.createdAt.getTime())) {
 *     errors.push('createdAt is an invalid Date');
 *   }
 *   
 *   if (!isDate(data.updatedAt)) {
 *     errors.push('updatedAt must be a Date object');
 *   } else if (isNaN(data.updatedAt.getTime())) {
 *     errors.push('updatedAt is an invalid Date');
 *   }
 *   
 *   if (errors.length > 0) {
 *     throw new Error(`Validation failed: ${errors.join(', ')}`);
 *   }
 *   
 *   return data as UserData & { createdAt: Date; updatedAt: Date };
 * }
 * ```
 *
 * @example
 * Date utility functions:
 * ```typescript
 * function formatDate(date: unknown, format: 'iso' | 'locale' | 'timestamp' = 'iso') {
 *   if (!isDate(date)) {
 *     throw new Error('Expected Date object');
 *   }
 *   
 *   if (isNaN(date.getTime())) {
 *     throw new Error('Invalid Date object');
 *   }
 *   
 *   switch (format) {
 *     case 'iso':
 *       return date.toISOString();
 *     case 'locale':
 *       return date.toLocaleDateString();
 *     case 'timestamp':
 *       return date.getTime();
 *     default:
 *       return date.toString();
 *   }
 * }
 * ```
 *
 * @example
 * Deep object date processing:
 * ```typescript
 * function convertDateStringsToObjects(obj: any): any {
 *   if (isDate(obj)) {
 *     return obj; // Already a Date object
 *   }
 *   
 *   if (typeof obj === 'string' && !isNaN(Date.parse(obj))) {
 *     return new Date(obj);
 *   }
 *   
 *   if (Array.isArray(obj)) {
 *     return obj.map(convertDateStringsToObjects);
 *   }
 *   
 *   if (obj && typeof obj === 'object') {
 *     const result: any = {};
 *     for (const [key, value] of Object.entries(obj)) {
 *       result[key] = convertDateStringsToObjects(value);
 *     }
 *     return result;
 *   }
 *   
 *   return obj;
 * }
 * ```
 *
 * @remarks
 * **Important Notes:**
 * - Returns `true` for all Date instances, including invalid dates
 * - Invalid dates (created with bad input) are still Date objects
 * - Use `isNaN(date.getTime())` to check for invalid dates
 * - More reliable than checking for date-like properties
 *
 * **Use Cases:**
 * - API response validation
 * - Date utility function guards
 * - Type narrowing before date operations
 * - Serialization/deserialization validation
 * - Form data validation
 *
 * **Related Functions:**
 * - Use `date.getTime()` and `isNaN()` to validate date values
 * - Use `Date.parse()` for string-to-date conversion validation
 * - Use `instanceof` directly if you don't need the type narrowing
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 */
export const isDate = (value: unknown): value is Date => value instanceof Date;