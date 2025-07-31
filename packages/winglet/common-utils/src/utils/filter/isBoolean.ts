/**
 * Determines whether a value is a boolean type with enhanced type safety.
 *
 * Provides reliable boolean type detection using native typeof check,
 * distinguishing true boolean values from boolean-like values or
 * truthy/falsy expressions.
 *
 * @param value - Value to test for boolean type
 * @returns Type-safe boolean indicating whether the value is a boolean
 *
 * @example
 * Boolean type detection:
 * ```typescript
 * import { isBoolean } from '@winglet/common-utils';
 *
 * // True cases - actual boolean values
 * console.log(isBoolean(true)); // true
 * console.log(isBoolean(false)); // true
 * console.log(isBoolean(Boolean(1))); // true
 * console.log(isBoolean(!!42)); // true
 * 
 * // False cases - not boolean type
 * console.log(isBoolean(1)); // false (truthy but not boolean)
 * console.log(isBoolean(0)); // false (falsy but not boolean)
 * console.log(isBoolean('true')); // false (string)
 * console.log(isBoolean('false')); // false (string)
 * console.log(isBoolean(null)); // false
 * console.log(isBoolean(undefined)); // false
 * console.log(isBoolean([])); // false (truthy but not boolean)
 * console.log(isBoolean({})); // false (truthy but not boolean)
 * ```
 *
 * @example
 * Configuration validation:
 * ```typescript
 * interface AppConfig {
 *   debug?: unknown;
 *   enableFeature?: unknown;
 *   autoSave?: unknown;
 * }
 *
 * function validateBooleanConfig(config: AppConfig) {
 *   const validConfig: Record<string, boolean> = {};
 *   
 *   for (const [key, value] of Object.entries(config)) {
 *     if (isBoolean(value)) {
 *       validConfig[key] = value;
 *     } else {
 *       console.warn(`Config ${key} should be boolean, got:`, typeof value);
 *       // Apply default or convert
 *       validConfig[key] = Boolean(value);
 *     }
 *   }
 *   
 *   return validConfig;
 * }
 * ```
 *
 * @example
 * Form data processing:
 * ```typescript
 * function processBooleanField(formValue: unknown): boolean {
 *   if (isBoolean(formValue)) {
 *     return formValue;
 *   }
 *   
 *   // Handle string representations
 *   if (typeof formValue === 'string') {
 *     const lower = formValue.toLowerCase();
 *     return lower === 'true' || lower === '1' || lower === 'yes';
 *   }
 *   
 *   // Convert other types
 *   return Boolean(formValue);
 * }
 *
 * // Usage
 * console.log(processBooleanField(true)); // true
 * console.log(processBooleanField('true')); // true
 * console.log(processBooleanField('false')); // false
 * console.log(processBooleanField(1)); // true
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface ApiFlags {
 *   isEnabled: unknown;
 *   hasAccess: unknown;
 *   isPublic: unknown;
 * }
 *
 * function validateApiFlags(flags: ApiFlags) {
 *   const errors: string[] = [];
 *   
 *   if (!isBoolean(flags.isEnabled)) {
 *     errors.push('isEnabled must be boolean');
 *   }
 *   
 *   if (!isBoolean(flags.hasAccess)) {
 *     errors.push('hasAccess must be boolean');
 *   }
 *   
 *   if (!isBoolean(flags.isPublic)) {
 *     errors.push('isPublic must be boolean');
 *   }
 *   
 *   if (errors.length > 0) {
 *     throw new Error(`Validation failed: ${errors.join(', ')}`);
 *   }
 *   
 *   return flags as { isEnabled: boolean; hasAccess: boolean; isPublic: boolean };
 * }
 * ```
 *
 * @example
 * Type guard usage:
 * ```typescript
 * function processValue(value: unknown) {
 *   if (isBoolean(value)) {
 *     // TypeScript knows value is boolean
 *     console.log(`Boolean value: ${value ? 'true' : 'false'}`);
 *     return value ? 1 : 0;
 *   }
 *   
 *   console.log('Not a boolean, converting...');
 *   return Boolean(value) ? 1 : 0;
 * }
 * ```
 *
 * @remarks
 * **Type Safety:**
 * - Distinguishes actual boolean type from truthy/falsy values
 * - Provides TypeScript type narrowing
 * - More precise than `!!value` or `Boolean(value)` for type checking
 *
 * **Use Cases:**
 * - Configuration validation
 * - API response validation
 * - Form data type checking
 * - Type guards before boolean operations
 * - Strict type validation in utilities
 *
 * **Performance:** Direct typeof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isTruthy()` for truthy value detection
 * - Use `Boolean()` for type conversion
 * - Use `!!value` for quick boolean conversion
 */
export const isBoolean = (value?: unknown): value is boolean =>
  typeof value === 'boolean';