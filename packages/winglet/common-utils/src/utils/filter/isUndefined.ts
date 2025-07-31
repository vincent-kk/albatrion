/**
 * Determines whether a value is undefined with enhanced type safety.
 *
 * Provides reliable undefined detection using strict equality check,
 * specifically identifying undefined values without including null.
 * More precise than `isNil()` when you need to distinguish between
 * null and undefined.
 *
 * @param value - Value to test for undefined type
 * @returns Type-safe boolean indicating whether the value is undefined
 *
 * @example
 * Basic undefined detection:
 * ```typescript
 * import { isUndefined } from '@winglet/common-utils';
 *
 * // True cases - undefined value
 * console.log(isUndefined(undefined)); // true
 * console.log(isUndefined(void 0)); // true (void 0 produces undefined)
 *
 * let uninitialized;
 * console.log(isUndefined(uninitialized)); // true
 *
 * // False cases - not undefined
 * console.log(isUndefined(null)); // false (null, not undefined)
 * console.log(isUndefined(0)); // false (falsy but not undefined)
 * console.log(isUndefined('')); // false (falsy but not undefined)
 * console.log(isUndefined(false)); // false (falsy but not undefined)
 * console.log(isUndefined(NaN)); // false (falsy but not undefined)
 * console.log(isUndefined({})); // false (object)
 * console.log(isUndefined('undefined')); // false (string)
 * ```
 *
 * @example
 * Optional parameter handling:
 * ```typescript
 * function processValue(value?: string | null) {
 *   if (isUndefined(value)) {
 *     console.log('Parameter was not provided');
 *     return 'DEFAULT_VALUE';
 *   }
 *
 *   if (value === null) {
 *     console.log('Parameter was explicitly set to null');
 *     return 'NULL_VALUE';
 *   }
 *
 *   // TypeScript knows value is string
 *   console.log('Parameter provided:', value);
 *   return value.toUpperCase();
 * }
 *
 * // Usage demonstrates different scenarios
 * console.log(processValue()); // 'DEFAULT_VALUE' (undefined)
 * console.log(processValue(undefined)); // 'DEFAULT_VALUE' (undefined)
 * console.log(processValue(null)); // 'NULL_VALUE' (null)
 * console.log(processValue('hello')); // 'HELLO' (string)
 * ```
 *
 * @example
 * Object property initialization:
 * ```typescript
 * interface UserPreferences {
 *   theme?: 'light' | 'dark';
 *   language?: string;
 *   notifications?: boolean;
 * }
 *
 * function initializePreferences(prefs: UserPreferences = {}) {
 *   const defaults = {
 *     theme: 'light' as const,
 *     language: 'en',
 *     notifications: true
 *   };
 *
 *   return {
 *     theme: isUndefined(prefs.theme) ? defaults.theme : prefs.theme,
 *     language: isUndefined(prefs.language) ? defaults.language : prefs.language,
 *     notifications: isUndefined(prefs.notifications) ? defaults.notifications : prefs.notifications
 *   };
 * }
 *
 * // Usage
 * const prefs1 = initializePreferences({ theme: 'dark' });
 * console.log(prefs1); // { theme: 'dark', language: 'en', notifications: true }
 *
 * const prefs2 = initializePreferences({});
 * console.log(prefs2); // { theme: 'light', language: 'en', notifications: true }
 * ```
 *
 * @example
 * API response processing:
 * ```typescript
 * interface ApiResponse {
 *   status: string;
 *   data?: any;
 *   error?: string;
 *   meta?: {
 *     page?: number;
 *     total?: number;
 *   };
 * }
 *
 * function processApiResponse(response: ApiResponse) {
 *   const result = {
 *     success: false,
 *     data: null as any,
 *     pagination: {
 *       page: 1,
 *       total: 0
 *     },
 *     error: null as string | null
 *   };
 *
 *   result.success = response.status === 'success';
 *
 *   if (!isUndefined(response.data)) {
 *     result.data = response.data;
 *   }
 *
 *   if (!isUndefined(response.error)) {
 *     result.error = response.error;
 *   }
 *
 *   if (!isUndefined(response.meta)) {
 *     if (!isUndefined(response.meta.page)) {
 *       result.pagination.page = response.meta.page;
 *     }
 *     if (!isUndefined(response.meta.total)) {
 *       result.pagination.total = response.meta.total;
 *     }
 *   }
 *
 *   return result;
 * }
 * ```
 *
 * @example
 * Function argument validation:
 * ```typescript
 * function createUser(
 *   name: string,
 *   email?: string,
 *   age?: number,
 *   options?: { sendWelcome?: boolean; role?: string }
 * ) {
 *   const user = {
 *     name,
 *     email: '',
 *     age: 0,
 *     sendWelcome: true,
 *     role: 'user'
 *   };
 *
 *   if (!isUndefined(email)) {
 *     user.email = email;
 *   }
 *
 *   if (!isUndefined(age)) {
 *     user.age = age;
 *   }
 *
 *   if (!isUndefined(options)) {
 *     if (!isUndefined(options.sendWelcome)) {
 *       user.sendWelcome = options.sendWelcome;
 *     }
 *     if (!isUndefined(options.role)) {
 *       user.role = options.role;
 *     }
 *   }
 *
 *   return user;
 * }
 *
 * // Usage
 * const user1 = createUser('John');
 * const user2 = createUser('Jane', 'jane@example.com', 25, { role: 'admin' });
 * ```
 *
 * @example
 * Configuration merging:
 * ```typescript
 * interface Config {
 *   apiUrl?: string;
 *   timeout?: number;
 *   retries?: number;
 *   debug?: boolean;
 * }
 *
 * function mergeConfigs(base: Config, override: Config): Config {
 *   const merged: Config = { ...base };
 *
 *   if (!isUndefined(override.apiUrl)) {
 *     merged.apiUrl = override.apiUrl;
 *   }
 *
 *   if (!isUndefined(override.timeout)) {
 *     merged.timeout = override.timeout;
 *   }
 *
 *   if (!isUndefined(override.retries)) {
 *     merged.retries = override.retries;
 *   }
 *
 *   if (!isUndefined(override.debug)) {
 *     merged.debug = override.debug;
 *   }
 *
 *   return merged;
 * }
 *
 * // Usage
 * const baseConfig = { apiUrl: 'https://api.example.com', timeout: 5000, debug: false };
 * const userConfig = { timeout: 10000, debug: true };
 * const final = mergeConfigs(baseConfig, userConfig);
 * // { apiUrl: 'https://api.example.com', timeout: 10000, debug: true }
 * ```
 *
 * @example
 * Type-safe property access:
 * ```typescript
 * function safeGet<T, K extends keyof T>(obj: T, key: K): T[K] | 'MISSING' {
 *   const value = obj[key];
 *
 *   if (isUndefined(value)) {
 *     return 'MISSING' as T[K] | 'MISSING';
 *   }
 *
 *   return value;
 * }
 *
 * function hasProperty<T, K extends keyof T>(obj: T, key: K): boolean {
 *   return !isUndefined(obj[key]);
 * }
 *
 * // Usage
 * const data = { name: 'John', age: undefined as number | undefined };
 * console.log(safeGet(data, 'name')); // 'John'
 * console.log(safeGet(data, 'age')); // 'MISSING'
 * console.log(hasProperty(data, 'name')); // true
 * console.log(hasProperty(data, 'age')); // false
 * ```
 *
 * @example
 * Environment variable processing:
 * ```typescript
 * function getEnvConfig() {
 *   const env = process.env;
 *
 *   return {
 *     nodeEnv: isUndefined(env.NODE_ENV) ? 'development' : env.NODE_ENV,
 *     port: isUndefined(env.PORT) ? 3000 : parseInt(env.PORT, 10),
 *     dbUrl: isUndefined(env.DATABASE_URL) ? 'sqlite://memory' : env.DATABASE_URL,
 *     debug: isUndefined(env.DEBUG) ? false : env.DEBUG === 'true'
 *   };
 * }
 *
 * // Handles both missing environment variables and empty strings
 * function getRequiredEnv(name: string): string {
 *   const value = process.env[name];
 *
 *   if (isUndefined(value)) {
 *     throw new Error(`Required environment variable ${name} is not defined`);
 *   }
 *
 *   if (value === '') {
 *     throw new Error(`Required environment variable ${name} is empty`);
 *   }
 *
 *   return value;
 * }
 * ```
 *
 * @remarks
 * **Key Differences from Similar Functions:**
 * - More specific than `isNil()` (which includes null)
 * - Uses strict equality (`===`) for precise undefined detection
 * - Important for APIs where null and undefined have different meanings
 * - Critical for optional parameter handling
 *
 * **JavaScript Undefined Behavior:**
 * - Uninitialized variables are undefined
 * - Missing object properties return undefined
 * - Missing function parameters are undefined
 * - `void 0` always produces undefined
 * - Array holes contain undefined
 *
 * **Use Cases:**
 * - Optional parameter validation
 * - Object property initialization
 * - Configuration merging
 * - API response processing
 * - Environment variable handling
 * - Type-safe property access
 *
 * **Performance:** Direct strict equality comparison provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isNil()` when null and undefined should be treated the same
 * - Use `isNull()` for null-only checking
 * - Use `isNotNil()` to exclude both null and undefined
 * - Use `typeof value === 'undefined'` for alternative checking
 */
export const isUndefined = (value?: unknown): value is undefined =>
  value === undefined;
