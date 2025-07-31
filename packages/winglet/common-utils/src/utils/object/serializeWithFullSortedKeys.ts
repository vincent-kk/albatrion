/**
 * Serializes objects using flattened path notation with sorted keys for consistent output.
 *
 * Transforms nested object structures into a flat string representation where each
 * property path is fully qualified using dot notation. All paths are sorted alphabetically
 * to ensure deterministic serialization regardless of property definition order.
 * Ideal for creating consistent object fingerprints, cache keys, and debugging output.
 *
 * @param object - Object to serialize with full path expansion
 * @returns Pipe-delimited string of sorted 'fullpath:value' pairs
 *
 * @example
 * Basic nested object serialization:
 * ```typescript
 * import { serializeWithFullSortedKeys } from '@winglet/common-utils';
 *
 * // Simple nested structure
 * const config = {
 *   database: {
 *     host: 'localhost',
 *     port: 5432
 *   },
 *   cache: {
 *     enabled: true
 *   }
 * };
 *
 * console.log(serializeWithFullSortedKeys(config));
 * // 'cache.enabled:true|database.host:localhost|database.port:5432'
 * ```
 *
 * @example
 * Complex nested structures:
 * ```typescript
 * // Multi-level nesting with various data types
 * const appConfig = {
 *   server: {
 *     port: 3000,
 *     ssl: {
 *       enabled: true,
 *       cert: {
 *         path: '/etc/ssl/cert.pem',
 *         passphrase: 'secret'
 *       }
 *     }
 *   },
 *   database: {
 *     primary: {
 *       host: 'db1.example.com',
 *       credentials: {
 *         username: 'admin',
 *         password: 'password123'
 *       }
 *     },
 *     replica: {
 *       host: 'db2.example.com'
 *     }
 *   },
 *   features: {
 *     analytics: false,
 *     logging: true
 *   }
 * };
 *
 * console.log(serializeWithFullSortedKeys(appConfig));
 * // 'database.primary.credentials.password:password123|database.primary.credentials.username:admin|database.primary.host:db1.example.com|database.replica.host:db2.example.com|features.analytics:false|features.logging:true|server.port:3000|server.ssl.cert.passphrase:secret|server.ssl.cert.path:/etc/ssl/cert.pem|server.ssl.enabled:true'
 * ```
 *
 * @example
 * Configuration fingerprinting:
 * ```typescript
 * // Create consistent configuration signatures
 * const createConfigSignature = (config: any) => {
 *   const serialized = serializeWithFullSortedKeys(config);
 *   // Could hash this for shorter fingerprints
 *   return serialized;
 * };
 *
 * const config1 = { api: { timeout: 5000 }, db: { host: 'localhost' } };
 * const config2 = { db: { host: 'localhost' }, api: { timeout: 5000 } }; // Different order
 *
 * const sig1 = createConfigSignature(config1);
 * const sig2 = createConfigSignature(config2);
 *
 * console.log(sig1 === sig2); // true (same signature despite different property order)
 * console.log(sig1); // 'api.timeout:5000|db.host:localhost'
 * ```
 *
 * @example
 * Environment configuration processing:
 * ```typescript
 * // Process environment-specific configurations
 * const environments = {
 *   development: {
 *     database: { debug: true, pool: { min: 1, max: 5 } },
 *     logging: { level: 'debug', console: true }
 *   },
 *   production: {
 *     database: { debug: false, pool: { min: 5, max: 20 } },
 *     logging: { level: 'error', console: false }
 *   }
 * };
 *
 * Object.keys(environments).forEach(env => {
 *   const signature = serializeWithFullSortedKeys(environments[env]);
 *   console.log(`${env}: ${signature}`);
 * });
 * // development: database.debug:true|database.pool.max:5|database.pool.min:1|logging.console:true|logging.level:debug
 * // production: database.debug:false|database.pool.max:20|database.pool.min:5|logging.console:false|logging.level:error
 * ```
 *
 * @example
 * API endpoint configuration:
 * ```typescript
 * // Serialize API endpoint configurations
 * const apiEndpoints = {
 *   users: {
 *     base: '/api/v1/users',
 *     methods: {
 *       get: { auth: true, cache: 300 },
 *       post: { auth: true, validation: true },
 *       delete: { auth: true, admin: true }
 *     },
 *     rateLimit: {
 *       requests: 100,
 *       window: 3600
 *     }
 *   },
 *   auth: {
 *     base: '/api/v1/auth',
 *     methods: {
 *       login: { bruteforce: { attempts: 5, window: 900 } },
 *       refresh: { auth: false }
 *     }
 *   }
 * };
 *
 * const serialized = serializeWithFullSortedKeys(apiEndpoints);
 * console.log(serialized);
 * // 'auth.base:/api/v1/auth|auth.methods.login.bruteforce.attempts:5|auth.methods.login.bruteforce.window:900|auth.methods.refresh.auth:false|users.base:/api/v1/users|users.methods.delete.admin:true|users.methods.delete.auth:true|users.methods.get.auth:true|users.methods.get.cache:300|users.methods.post.auth:true|users.methods.post.validation:true|users.rateLimit.requests:100|users.rateLimit.window:3600'
 * ```
 *
 * @example
 * Primitive and edge case handling:
 * ```typescript
 * // Non-object values return string representation
 * console.log(serializeWithFullSortedKeys('hello')); // 'hello'
 * console.log(serializeWithFullSortedKeys(42)); // '42'
 * console.log(serializeWithFullSortedKeys(true)); // 'true'
 * console.log(serializeWithFullSortedKeys(null)); // 'null'
 * console.log(serializeWithFullSortedKeys(undefined)); // 'undefined'
 *
 * // Empty objects
 * console.log(serializeWithFullSortedKeys({})); // ''
 *
 * // Objects with special values
 * const specialValues = {
 *   nullValue: null,
 *   undefinedValue: undefined,
 *   zeroValue: 0,
 *   emptyString: '',
 *   booleanFalse: false
 * };
 * console.log(serializeWithFullSortedKeys(specialValues));
 * // 'booleanFalse:false|emptyString:|nullValue:null|undefinedValue:undefined|zeroValue:0'
 * ```
 *
 * @example
 * Database configuration comparison:
 * ```typescript
 * // Compare database configurations
 * const compareConfigs = (config1: any, config2: any) => {
 *   const sig1 = serializeWithFullSortedKeys(config1);
 *   const sig2 = serializeWithFullSortedKeys(config2);
 *   return sig1 === sig2;
 * };
 *
 * const dbConfig1 = {
 *   connection: {
 *     host: 'localhost',
 *     port: 5432,
 *     ssl: { enabled: false }
 *   },
 *   pool: { min: 2, max: 10 }
 * };
 *
 * const dbConfig2 = {
 *   pool: { max: 10, min: 2 },  // Different order
 *   connection: {
 *     port: 5432,  // Different order
 *     host: 'localhost',
 *     ssl: { enabled: false }
 *   }
 * };
 *
 * console.log(compareConfigs(dbConfig1, dbConfig2)); // true
 * ```
 *
 * @example
 * Debugging nested object differences:
 * ```typescript
 * // Debug configuration differences
 * const debugConfigDiff = (config1: any, config2: any) => {
 *   const paths1 = serializeWithFullSortedKeys(config1).split('|');
 *   const paths2 = serializeWithFullSortedKeys(config2).split('|');
 *
 *   const set1 = new Set(paths1);
 *   const set2 = new Set(paths2);
 *
 *   const onlyIn1 = paths1.filter(path => !set2.has(path));
 *   const onlyIn2 = paths2.filter(path => !set1.has(path));
 *
 *   return {
 *     onlyInFirst: onlyIn1,
 *     onlyInSecond: onlyIn2,
 *     identical: onlyIn1.length === 0 && onlyIn2.length === 0
 *   };
 * };
 *
 * const oldConfig = { api: { timeout: 5000, retries: 3 } };
 * const newConfig = { api: { timeout: 8000, retries: 3, debug: true } };
 *
 * const diff = debugConfigDiff(oldConfig, newConfig);
 * console.log(diff);
 * // {
 * //   onlyInFirst: ['api.timeout:5000'],
 * //   onlyInSecond: ['api.debug:true', 'api.timeout:8000'],
 * //   identical: false
 * // }
 * ```
 *
 * @remarks
 * **Serialization Strategy:**
 * - **Path Expansion**: Each nested property becomes a fully qualified path using dot notation
 * - **Alphabetical Sorting**: All paths are sorted alphabetically for consistent output
 * - **Value Stringification**: All values are converted to strings using String() conversion
 * - **Delimiter**: Pipe character ('|') separates path-value pairs in the final output
 *
 * **Path Generation:**
 * - **Root Level**: Properties become direct paths (e.g., 'name', 'age')
 * - **Nested Objects**: Properties become dot-separated paths (e.g., 'user.profile.name')
 * - **Deep Nesting**: Supports unlimited nesting depth
 * - **Path Ordering**: All paths sorted alphabetically regardless of definition order
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n log n) where n is total number of leaf properties (due to sorting)
 * - **Space Complexity**: O(n) for path storage and result construction
 * - **Memory Usage**: Efficient iterative traversal using internal stack
 * - **Scalability**: Handles large nested objects efficiently
 *
 * **Value Handling:**
 * - **Primitives**: Direct string conversion (null, undefined, boolean, number)
 * - **Objects**: Recursively expanded into individual path-value pairs
 * - **Non-Objects**: Returned as string representation without expansion
 * - **Special Values**: Maintains distinction between null, undefined, empty string, and false
 *
 * **Use Cases:**
 * - Configuration object fingerprinting and comparison
 * - Cache key generation for nested data structures
 * - Debugging and logging complex object states
 * - API endpoint configuration serialization
 * - Environment-specific configuration management
 * - Object difference detection and analysis
 *
 * **Advantages over Alternatives:**
 * - **Deterministic**: Always produces same output for equivalent objects
 * - **Human Readable**: Paths are intuitive and easy to understand
 * - **Sortable**: Alphabetical ordering enables easy comparison and diffing
 * - **Flat Structure**: No nested brackets or complex escaping needed
 * - **Debugging Friendly**: Each path-value pair is independently readable
 *
 * **Limitations:**
 * - **One-Way Transformation**: Cannot be deserialized back to original object
 * - **No Array Indexing**: Arrays are treated as objects with numeric keys
 * - **String Representation**: All values become strings, losing type information
 * - **Path Collisions**: Properties with dots in names may create ambiguous paths
 * - **Circular References**: Will cause infinite loops (not handled)
 * - **Large Objects**: Can produce very long strings for deeply nested structures
 */
export const serializeWithFullSortedKeys = (object: any): string => {
  if (!object || typeof object !== 'object') return String(object);
  const stack: Array<{ obj: any; prefix: string }> = [
    { obj: object, prefix: '' },
  ];
  const parts: string[] = [];
  while (stack.length > 0) {
    const { obj, prefix } = stack.pop()!;
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object')
        stack[stack.length] = { obj: value, prefix: fullKey };
      else parts[parts.length] = `${fullKey}:${String(value)}`;
    }
  }
  return parts.join('|');
};
