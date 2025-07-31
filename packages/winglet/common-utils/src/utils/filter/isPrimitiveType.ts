/**
 * Determines whether a value is a primitive type with enhanced type safety.
 *
 * Identifies JavaScript primitive types including null, undefined, string,
 * number, boolean, symbol, and bigint. Uses efficient type checking that
 * excludes objects and functions, providing reliable primitive detection.
 *
 * @param value - Value to test for primitive type characteristics
 * @returns Type-safe boolean indicating whether the value is a primitive type
 *
 * @example
 * Basic primitive type detection:
 * ```typescript
 * import { isPrimitiveType } from '@winglet/common-utils';
 *
 * // True cases - primitive types
 * console.log(isPrimitiveType(null)); // true
 * console.log(isPrimitiveType(undefined)); // true
 * console.log(isPrimitiveType('hello')); // true (string)
 * console.log(isPrimitiveType(42)); // true (number)
 * console.log(isPrimitiveType(true)); // true (boolean)
 * console.log(isPrimitiveType(false)); // true (boolean)
 * console.log(isPrimitiveType(Symbol('test'))); // true (symbol)
 * console.log(isPrimitiveType(BigInt(123))); // true (bigint)
 * console.log(isPrimitiveType(0)); // true (number)
 * console.log(isPrimitiveType('')); // true (string)
 * console.log(isPrimitiveType(NaN)); // true (number)
 * console.log(isPrimitiveType(Infinity)); // true (number)
 * 
 * // False cases - non-primitive types
 * console.log(isPrimitiveType({})); // false (object)
 * console.log(isPrimitiveType([])); // false (array/object)
 * console.log(isPrimitiveType(() => {})); // false (function)
 * console.log(isPrimitiveType(new Date())); // false (Date object)
 * console.log(isPrimitiveType(new String('test'))); // false (boxed string)
 * console.log(isPrimitiveType(new Number(42))); // false (boxed number)
 * console.log(isPrimitiveType(/regex/)); // false (RegExp object)
 * ```
 *
 * @example
 * Data processing and filtering:
 * ```typescript
 * function separateDataTypes(values: unknown[]) {
 *   const primitives: PrimitiveType[] = [];
 *   const objects: object[] = [];
 *   
 *   for (const value of values) {
 *     if (isPrimitiveType(value)) {
 *       primitives.push(value);
 *     } else {
 *       objects.push(value as object);
 *     }
 *   }
 *   
 *   return { primitives, objects };
 * }
 *
 * // Usage
 * const mixed = [
 *   'hello', 42, {}, [], true, null, new Date(), Symbol('test'), BigInt(100)
 * ];
 * 
 * const separated = separateDataTypes(mixed);
 * console.log('Primitives:', separated.primitives);
 * // ['hello', 42, true, null, Symbol(test), 100n]
 * console.log('Objects:', separated.objects);
 * // [{}, [], Date object]
 * ```
 *
 * @example
 * Serialization safety checking:
 * ```typescript
 * function canSerializeDirectly(value: unknown): boolean {
 *   if (!isPrimitiveType(value)) {
 *     return false; // Objects need special handling
 *   }
 *   
 *   // Most primitives can be serialized, but symbols and bigint need special handling
 *   if (typeof value === 'symbol' || typeof value === 'bigint') {
 *     return false;
 *   }
 *   
 *   return true;
 * }
 *
 * function safeSerialize(data: unknown): string {
 *   if (canSerializeDirectly(data)) {
 *     return JSON.stringify(data);
 *   }
 *   
 *   if (typeof data === 'symbol') {
 *     return JSON.stringify({ __symbol: data.toString() });
 *   }
 *   
 *   if (typeof data === 'bigint') {
 *     return JSON.stringify({ __bigint: data.toString() });
 *   }
 *   
 *   // Handle objects separately
 *   return JSON.stringify(data);
 * }
 * ```
 *
 * @example
 * Memory usage optimization:
 * ```typescript
 * interface MemoryAnalysis {
 *   type: string;
 *   isPrimitive: boolean;
 *   storageType: 'value' | 'reference';
 *   canHaveProperties: boolean;
 *   size: 'small' | 'variable';
 * }
 *
 * function analyzeMemoryUsage(value: unknown): MemoryAnalysis {
 *   const isPrimitive = isPrimitiveType(value);
 *   
 *   return {
 *     type: typeof value,
 *     isPrimitive,
 *     storageType: isPrimitive ? 'value' : 'reference',
 *     canHaveProperties: !isPrimitive,
 *     size: isPrimitive ? 'small' : 'variable'
 *   };
 * }
 *
 * // Usage for performance analysis
 * const values = [42, 'hello', {}, [], new Date(), true, Symbol('test')];
 * values.forEach(value => {
 *   const analysis = analyzeMemoryUsage(value);
 *   console.log(`${typeof value}:`, analysis);
 * });
 * ```
 *
 * @example
 * Deep clone optimization:
 * ```typescript
 * function smartDeepClone(value: unknown): unknown {
 *   if (isPrimitiveType(value)) {
 *     // Primitives are immutable and copied by value
 *     return value;
 *   }
 *   
 *   // Handle different object types
 *   if (Array.isArray(value)) {
 *     return value.map(smartDeepClone);
 *   }
 *   
 *   if (value instanceof Date) {
 *     return new Date(value.getTime());
 *   }
 *   
 *   if (value instanceof RegExp) {
 *     return new RegExp(value.source, value.flags);
 *   }
 *   
 *   if (value && typeof value === 'object') {
 *     const cloned: any = {};
 *     for (const [key, val] of Object.entries(value)) {
 *       cloned[key] = smartDeepClone(val);
 *     }
 *     return cloned;
 *   }
 *   
 *   return value;
 * }
 * ```
 *
 * @example
 * Form data validation:
 * ```typescript
 * interface FormField {
 *   name: string;
 *   value: unknown;
 *   required: boolean;
 * }
 *
 * function validateFormField(field: FormField): string | null {
 *   if (field.required && (field.value === null || field.value === undefined)) {
 *     return `${field.name} is required`;
 *   }
 *   
 *   if (!isPrimitiveType(field.value)) {
 *     return `${field.name} must be a primitive value (string, number, boolean, etc.)`;
 *   }
 *   
 *   // Additional primitive-specific validation
 *   if (typeof field.value === 'string' && field.value.trim().length === 0) {
 *     return `${field.name} cannot be empty`;
 *   }
 *   
 *   if (typeof field.value === 'number' && isNaN(field.value)) {
 *     return `${field.name} must be a valid number`;
 *   }
 *   
 *   return null; // Valid
 * }
 * ```
 *
 * @example
 * Database value preparation:
 * ```typescript
 * function prepareDatabaseValue(value: unknown): any {
 *   if (!isPrimitiveType(value)) {
 *     throw new Error('Database values must be primitive types');
 *   }
 *   
 *   // Handle special primitive cases
 *   if (typeof value === 'symbol') {
 *     return value.toString(); // Convert symbol to string
 *   }
 *   
 *   if (typeof value === 'bigint') {
 *     return value.toString(); // Convert bigint to string
 *   }
 *   
 *   // null, undefined, string, number, boolean can be stored directly
 *   return value;
 * }
 *
 * function insertRecord(data: Record<string, unknown>) {
 *   const preparedData: Record<string, any> = {};
 *   
 *   for (const [key, value] of Object.entries(data)) {
 *     try {
 *       preparedData[key] = prepareDatabaseValue(value);
 *     } catch (error) {
 *       throw new Error(`Invalid value for field ${key}: ${error.message}`);
 *     }
 *   }
 *   
 *   return preparedData;
 * }
 * ```
 *
 * @remarks
 * **JavaScript Primitive Types (7 total):**
 * 1. `null` - represents intentional absence of value
 * 2. `undefined` - represents uninitialized or missing value
 * 3. `string` - text data
 * 4. `number` - numeric data (including NaN, Infinity)
 * 5. `boolean` - true/false values
 * 6. `symbol` - unique identifiers (ES6+)
 * 7. `bigint` - arbitrary precision integers (ES2020+)
 *
 * **Key Characteristics:**
 * - Immutable (cannot be changed)
 * - Stored by value (not reference)
 * - Cannot have properties added to them
 * - Comparison by value equality
 *
 * **Use Cases:**
 * - Memory usage optimization
 * - Serialization logic
 * - Deep clone optimization
 * - Database value validation
 * - Form data processing
 * - Type system utilities
 *
 * **Performance:** Efficient compound check using logical operators.
 *
 * **Related Functions:**
 * - Use `isPrimitiveObject()` for reference behavior analysis
 * - Use specific type checkers (`isString()`, `isNumber()`, etc.) for precise type checking
 * - Use `typeof` for basic type identification
 */
export const isPrimitiveType = (value: unknown): value is PrimitiveType =>
  value == null || (typeof value !== 'object' && typeof value !== 'function');

/**
 * Union type representing all JavaScript primitive types.
 * 
 * Includes all seven primitive types in JavaScript:
 * - null and undefined (nil values)
 * - string, number, boolean (basic data types)
 * - symbol, bigint (ES6+ primitive types)
 */
export type PrimitiveType =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;