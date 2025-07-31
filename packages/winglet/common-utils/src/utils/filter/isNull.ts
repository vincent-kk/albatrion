/**
 * Determines whether a value is null with enhanced type safety.
 *
 * Provides reliable null detection using strict equality check, specifically
 * identifying null values without including undefined. More precise than
 * `isNil()` when you need to distinguish between null and undefined.
 *
 * @param value - Value to test for null type
 * @returns Type-safe boolean indicating whether the value is null
 *
 * @example
 * Basic null detection:
 * ```typescript
 * import { isNull } from '@winglet/common-utils';
 *
 * // True cases - null value
 * console.log(isNull(null)); // true
 * 
 * // False cases - not null
 * console.log(isNull(undefined)); // false (undefined, not null)
 * console.log(isNull(0)); // false (falsy but not null)
 * console.log(isNull('')); // false (falsy but not null)
 * console.log(isNull(false)); // false (falsy but not null)
 * console.log(isNull(NaN)); // false (falsy but not null)
 * console.log(isNull({})); // false (object)
 * console.log(isNull([])); // false (array)
 * console.log(isNull('hello')); // false (string)
 * console.log(isNull(42)); // false (number)
 * ```
 *
 * @example
 * Distinguishing null from undefined:
 * ```typescript
 * function handleOptionalValue(value: string | null | undefined) {
 *   if (isNull(value)) {
 *     console.log('Value was explicitly set to null');
 *     return 'NULL_VALUE';
 *   }
 *   
 *   if (value === undefined) {
 *     console.log('Value was not provided');
 *     return 'MISSING_VALUE';
 *   }
 *   
 *   // TypeScript knows value is string
 *   console.log('Value provided:', value);
 *   return value.toUpperCase();
 * }
 *
 * // Usage demonstrates different handling
 * console.log(handleOptionalValue(null)); // 'NULL_VALUE'
 * console.log(handleOptionalValue(undefined)); // 'MISSING_VALUE'
 * console.log(handleOptionalValue('hello')); // 'HELLO'
 * ```
 *
 * @example
 * Database record processing:
 * ```typescript
 * interface DatabaseRecord {
 *   id: number;
 *   name: string;
 *   email: string | null; // null means intentionally blank
 *   phone?: string; // undefined means not collected
 *   avatar: string | null; // null means no avatar set
 * }
 *
 * function processRecord(record: DatabaseRecord) {
 *   const result = {
 *     id: record.id,
 *     name: record.name,
 *     hasEmail: !isNull(record.email),
 *     hasPhone: record.phone !== undefined,
 *     hasAvatar: !isNull(record.avatar)
 *   };
 *   
 *   if (isNull(record.email)) {
 *     console.log('Email intentionally left blank');
 *   } else {
 *     console.log('Email provided:', record.email);
 *   }
 *   
 *   return result;
 * }
 * ```
 *
 * @example
 * API payload validation:
 * ```typescript
 * interface UpdatePayload {
 *   name?: string;
 *   email?: string | null; // null to clear, undefined to ignore
 *   avatar?: string | null;
 * }
 *
 * function processUpdate(current: any, payload: UpdatePayload) {
 *   const updates: any = { ...current };
 *   
 *   if (payload.name !== undefined) {
 *     updates.name = payload.name;
 *   }
 *   
 *   if (payload.email !== undefined) {
 *     if (isNull(payload.email)) {
 *       console.log('Clearing email field');
 *       updates.email = null;
 *     } else {
 *       console.log('Updating email to:', payload.email);
 *       updates.email = payload.email;
 *     }
 *   }
 *   
 *   if (payload.avatar !== undefined) {
 *     if (isNull(payload.avatar)) {
 *       console.log('Removing avatar');
 *       updates.avatar = null;
 *     } else {
 *       console.log('Setting new avatar');
 *       updates.avatar = payload.avatar;
 *     }
 *   }
 *   
 *   return updates;
 * }
 * ```
 *
 * @example
 * Form field state management:
 * ```typescript
 * interface FormFieldState {
 *   value: string | null;
 *   error?: string;
 *   touched: boolean;
 * }
 *
 * function validateFormField(state: FormFieldState): FormFieldState {
 *   if (isNull(state.value)) {
 *     // null means user explicitly cleared the field
 *     return {
 *       ...state,
 *       error: 'This field is required and cannot be empty'
 *     };
 *   }
 *   
 *   if (state.value.trim().length === 0) {
 *     // Empty string is different from null
 *     return {
 *       ...state,
 *       error: 'This field cannot contain only whitespace'
 *     };
 *   }
 *   
 *   return {
 *     ...state,
 *     error: undefined
 *   };
 * }
 * ```
 *
 * @example
 * JSON serialization handling:
 * ```typescript
 * function prepareForSerialization(obj: Record<string, any>) {
 *   const result: Record<string, any> = {};
 *   
 *   for (const [key, value] of Object.entries(obj)) {
 *     if (isNull(value)) {
 *       // Keep null values in JSON (they serialize to null)
 *       result[key] = null;
 *     } else if (value !== undefined) {
 *       // Include defined values
 *       result[key] = value;
 *     }
 *     // Skip undefined values (they don't serialize in JSON)
 *   }
 *   
 *   return result;
 * }
 *
 * // Usage
 * const data = {
 *   name: 'John',
 *   email: null, // intentionally null
 *   phone: undefined, // not provided
 *   active: true
 * };
 *
 * const serializable = prepareForSerialization(data);
 * // { name: 'John', email: null, active: true }
 * console.log(JSON.stringify(serializable)); // {"name":"John","email":null,"active":true}
 * ```
 *
 * @example
 * Cache value handling:
 * ```typescript
 * class Cache<T> {
 *   private store = new Map<string, T | null>();
 *   
 *   set(key: string, value: T | null): void {
 *     this.store.set(key, value);
 *   }
 *   
 *   get(key: string): T | null | undefined {
 *     return this.store.get(key);
 *   }
 *   
 *   has(key: string): boolean {
 *     return this.store.has(key);
 *   }
 *   
 *   isNullValue(key: string): boolean {
 *     const value = this.store.get(key);
 *     return this.store.has(key) && isNull(value);
 *   }
 * }
 *
 * // Usage distinguishes between "not cached" and "cached as null"
 * const cache = new Cache<string>();
 * cache.set('user:1', null); // explicitly cached as null
 * 
 * console.log(cache.has('user:1')); // true (key exists)
 * console.log(cache.isNullValue('user:1')); // true (cached as null)
 * console.log(cache.has('user:2')); // false (key doesn't exist)
 * console.log(cache.isNullValue('user:2')); // false (not cached)
 * ```
 *
 * @remarks
 * **Key Differences from Similar Functions:**
 * - More specific than `isNil()` (which includes undefined)
 * - Uses strict equality (`===`) for precise null detection
 * - Important for APIs where null and undefined have different meanings
 * - Critical for JSON serialization scenarios
 *
 * **Common Use Cases:**
 * - Database field validation (null vs missing)
 * - API payload processing (clear vs ignore)
 * - Form state management
 * - JSON serialization preparation
 * - Cache value distinction
 *
 * **Performance:** Direct strict equality comparison provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isNil()` when null and undefined should be treated the same
 * - Use `isUndefined()` for undefined-only checking
 * - Use `isNotNil()` to exclude both null and undefined
 * - Use `value == null` to check for both null and undefined
 */
export const isNull = (value?: unknown): value is null => value === null;