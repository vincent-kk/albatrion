/**
 * Determines whether a value is a WeakMap object with enhanced type safety.
 *
 * Provides reliable WeakMap detection using instanceof check with generic
 * type support for type-safe WeakMap validation and processing. WeakMaps
 * provide garbage-collection-friendly key-value storage with object keys.
 *
 * @template T - Expected WeakMap type extending WeakMap<any, any>
 * @param value - Value to test for WeakMap type
 * @returns Type-safe boolean indicating whether the value is a WeakMap
 *
 * @example
 * Basic WeakMap detection:
 * ```typescript
 * import { isWeakMap } from '@winglet/common-utils';
 *
 * // True cases - WeakMap instances
 * console.log(isWeakMap(new WeakMap())); // true
 *
 * const keyObj = {};
 * const valueObj = { data: 'test' };
 * const weakMap = new WeakMap([[keyObj, valueObj]]);
 * console.log(isWeakMap(weakMap)); // true
 *
 * // False cases - not WeakMap instances
 * console.log(isWeakMap(new Map())); // false (Map, not WeakMap)
 * console.log(isWeakMap({})); // false (plain object)
 * console.log(isWeakMap(new Set())); // false (Set)
 * console.log(isWeakMap(new WeakSet())); // false (WeakSet, not WeakMap)
 * console.log(isWeakMap(null)); // false
 * console.log(isWeakMap(undefined)); // false
 * console.log(isWeakMap('weakmap')); // false (string)
 * ```
 *
 * @example
 * Private data storage:
 * ```typescript
 * class UserManager {
 *   private privateData = new WeakMap<object, { secrets: string[]; metadata: any }>();
 *
 *   attachPrivateData(user: object, secrets: string[], metadata: any) {
 *     if (!isWeakMap(this.privateData)) {
 *       throw new Error('Private data storage must be a WeakMap');
 *     }
 *
 *     this.privateData.set(user, { secrets, metadata });
 *   }
 *
 *   getPrivateData(user: object) {
 *     if (!isWeakMap(this.privateData)) {
 *       return null;
 *     }
 *
 *     return this.privateData.get(user) || null;
 *   }
 *
 *   hasPrivateData(user: object): boolean {
 *     if (!isWeakMap(this.privateData)) {
 *       return false;
 *     }
 *
 *     return this.privateData.has(user);
 *   }
 * }
 *
 * // Usage
 * const manager = new UserManager();
 * const user = { id: 1, name: 'John' };
 * manager.attachPrivateData(user, ['secret1', 'secret2'], { role: 'admin' });
 *
 * console.log(manager.hasPrivateData(user)); // true
 * console.log(manager.getPrivateData(user)); // { secrets: [...], metadata: {...} }
 * ```
 *
 * @example
 * Memory-safe caching:
 * ```typescript
 * interface CacheStorage {
 *   cache: unknown;
 * }
 *
 * class MemoryEfficientCache implements CacheStorage {
 *   cache = new WeakMap<object, any>();
 *
 *   validateCache(): boolean {
 *     return isWeakMap(this.cache);
 *   }
 *
 *   set(key: object, value: any): void {
 *     if (!this.validateCache()) {
 *       throw new Error('Cache must be a WeakMap for memory efficiency');
 *     }
 *
 *     this.cache.set(key, value);
 *   }
 *
 *   get(key: object): any {
 *     if (!this.validateCache()) {
 *       return undefined;
 *     }
 *
 *     return this.cache.get(key);
 *   }
 *
 *   has(key: object): boolean {
 *     if (!this.validateCache()) {
 *       return false;
 *     }
 *
 *     return this.cache.has(key);
 *   }
 *
 *   delete(key: object): boolean {
 *     if (!this.validateCache()) {
 *       return false;
 *     }
 *
 *     return this.cache.delete(key);
 *   }
 * }
 *
 * // Usage - objects automatically garbage collected when no longer referenced
 * const cache = new MemoryEfficientCache();
 * let tempObject = { id: 123 };
 *
 * cache.set(tempObject, 'cached data');
 * console.log(cache.has(tempObject)); // true
 *
 * tempObject = null; // Object becomes eligible for garbage collection
 * // Cache entry will be automatically removed by garbage collector
 * ```
 *
 * @example
 * DOM element metadata storage:
 * ```typescript
 * class ElementMetadataManager {
 *   private metadata = new WeakMap<Element, {
 *     created: Date;
 *     listeners: string[];
 *     customData: any;
 *   }>();
 *
 *   validateStorage(): boolean {
 *     return isWeakMap(this.metadata);
 *   }
 *
 *   attachMetadata(element: Element, customData?: any): void {
 *     if (!this.validateStorage()) {
 *       throw new Error('Metadata storage must be a WeakMap');
 *     }
 *
 *     this.metadata.set(element, {
 *       created: new Date(),
 *       listeners: [],
 *       customData: customData || {}
 *     });
 *   }
 *
 *   addListener(element: Element, eventType: string): void {
 *     if (!this.validateStorage()) {
 *       return;
 *     }
 *
 *     const meta = this.metadata.get(element);
 *     if (meta) {
 *       meta.listeners.push(eventType);
 *     }
 *   }
 *
 *   getMetadata(element: Element) {
 *     if (!this.validateStorage()) {
 *       return null;
 *     }
 *
 *     return this.metadata.get(element) || null;
 *   }
 *
 *   cleanup(element: Element): boolean {
 *     if (!this.validateStorage()) {
 *       return false;
 *     }
 *
 *     return this.metadata.delete(element);
 *   }
 * }
 *
 * // Usage with DOM elements
 * const manager = new ElementMetadataManager();
 * const button = document.createElement('button');
 *
 * manager.attachMetadata(button, { componentId: 'submit-btn' });
 * manager.addListener(button, 'click');
 *
 * console.log(manager.getMetadata(button));
 * // When button is removed from DOM and loses all references,
 * // metadata is automatically garbage collected
 * ```
 *
 * @example
 * Object relationship tracking:
 * ```typescript
 * interface Relationship {
 *   type: 'parent' | 'child' | 'sibling';
 *   target: object;
 *   metadata?: any;
 * }
 *
 * class ObjectRelationshipTracker {
 *   private relationships = new WeakMap<object, Relationship[]>();
 *
 *   validateTracker(): boolean {
 *     return isWeakMap(this.relationships);
 *   }
 *
 *   addRelationship(source: object, relationship: Relationship): void {
 *     if (!this.validateTracker()) {
 *       throw new Error('Relationship tracker must use WeakMap');
 *     }
 *
 *     const existing = this.relationships.get(source) || [];
 *     existing.push(relationship);
 *     this.relationships.set(source, existing);
 *   }
 *
 *   getRelationships(source: object): Relationship[] {
 *     if (!this.validateTracker()) {
 *       return [];
 *     }
 *
 *     return this.relationships.get(source) || [];
 *   }
 *
 *   hasRelationship(source: object, type: Relationship['type']): boolean {
 *     if (!this.validateTracker()) {
 *       return false;
 *     }
 *
 *     const relationships = this.relationships.get(source) || [];
 *     return relationships.some(rel => rel.type === type);
 *   }
 *
 *   removeRelationships(source: object): boolean {
 *     if (!this.validateTracker()) {
 *       return false;
 *     }
 *
 *     return this.relationships.delete(source);
 *   }
 * }
 * ```
 *
 * @example
 * Validation utility for WeakMap-based systems:
 * ```typescript
 * function validateWeakMapStorage(storages: unknown[]): {
 *   valid: WeakMap<any, any>[];
 *   invalid: unknown[];
 *   report: string;
 * } {
 *   const valid: WeakMap<any, any>[] = [];
 *   const invalid: unknown[] = [];
 *
 *   storages.forEach((storage, index) => {
 *     if (isWeakMap(storage)) {
 *       valid.push(storage);
 *     } else {
 *       invalid.push(storage);
 *       console.warn(`Storage ${index} is not a WeakMap:`, typeof storage);
 *     }
 *   });
 *
 *   const report = `Validated ${storages.length} storages: ${valid.length} valid WeakMaps, ${invalid.length} invalid`;
 *
 *   return { valid, invalid, report };
 * }
 *
 * // Usage
 * const storages = [
 *   new WeakMap(),
 *   new Map(),
 *   {},
 *   new WeakMap([[{}, 'data']]),
 *   'not-a-map'
 * ];
 *
 * const validation = validateWeakMapStorage(storages);
 * console.log(validation.report);
 * // "Validated 5 storages: 2 valid WeakMaps, 3 invalid"
 * ```
 *
 * @remarks
 * **WeakMap Characteristics:**
 * - Keys must be objects (not primitives)
 * - Entries are automatically garbage collected when keys are no longer referenced
 * - No enumeration methods (no size, keys(), values(), entries())
 * - Perfect for private data storage and memory-efficient caching
 * - Cannot cause memory leaks through key retention
 *
 * **Key Limitations:**
 * - Keys must be objects, not primitives
 * - No way to iterate over entries
 * - No size property
 * - Cannot be cleared all at once
 * - Not suitable when you need to enumerate entries
 *
 * **Use Cases:**
 * - Private data storage for objects
 * - Memory-efficient caching
 * - DOM element metadata
 * - Object relationship tracking
 * - Avoiding memory leaks in long-running applications
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isMap()` for regular Map detection
 * - Use `isWeakSet()` for WeakSet detection
 * - Use `isObject()` for general object detection
 */
export const isWeakMap = <T extends WeakMap<any, any>>(
  value: unknown,
): value is T => value instanceof WeakMap;
