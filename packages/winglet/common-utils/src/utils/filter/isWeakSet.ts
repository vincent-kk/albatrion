/**
 * Determines whether a value is a WeakSet object with enhanced type safety.
 *
 * Provides reliable WeakSet detection using instanceof check with generic
 * type support for type-safe WeakSet validation and processing. WeakSets
 * provide garbage-collection-friendly storage for unique object references.
 *
 * @template T - Expected WeakSet type extending WeakSet<any>
 * @param value - Value to test for WeakSet type
 * @returns Type-safe boolean indicating whether the value is a WeakSet
 *
 * @example
 * Basic WeakSet detection:
 * ```typescript
 * import { isWeakSet } from '@winglet/common-utils';
 *
 * // True cases - WeakSet instances
 * console.log(isWeakSet(new WeakSet())); // true
 *
 * const obj1 = {};
 * const obj2 = {};
 * const weakSet = new WeakSet([obj1, obj2]);
 * console.log(isWeakSet(weakSet)); // true
 *
 * // False cases - not WeakSet instances
 * console.log(isWeakSet(new Set())); // false (Set, not WeakSet)
 * console.log(isWeakSet(new WeakMap())); // false (WeakMap, not WeakSet)
 * console.log(isWeakSet([])); // false (array)
 * console.log(isWeakSet({})); // false (plain object)
 * console.log(isWeakSet(null)); // false
 * console.log(isWeakSet(undefined)); // false
 * console.log(isWeakSet('weakset')); // false (string)
 * ```
 *
 * @example
 * Object tracking without memory leaks:
 * ```typescript
 * class ProcessedObjectTracker {
 *   private processed = new WeakSet<object>();
 *
 *   validateTracker(): boolean {
 *     return isWeakSet(this.processed);
 *   }
 *
 *   markAsProcessed(obj: object): void {
 *     if (!this.validateTracker()) {
 *       throw new Error('Processed tracker must be a WeakSet');
 *     }
 *
 *     this.processed.add(obj);
 *   }
 *
 *   isProcessed(obj: object): boolean {
 *     if (!this.validateTracker()) {
 *       return false;
 *     }
 *
 *     return this.processed.has(obj);
 *   }
 *
 *   processIfNeeded(obj: object, processor: (obj: object) => void): boolean {
 *     if (this.isProcessed(obj)) {
 *       console.log('Object already processed, skipping');
 *       return false;
 *     }
 *
 *     processor(obj);
 *     this.markAsProcessed(obj);
 *     return true;
 *   }
 * }
 *
 * // Usage
 * const tracker = new ProcessedObjectTracker();
 * const dataObject = { id: 1, data: 'important' };
 *
 * tracker.processIfNeeded(dataObject, (obj) => {
 *   console.log('Processing:', obj);
 *   // Do some processing...
 * });
 *
 * // Second call will skip processing
 * tracker.processIfNeeded(dataObject, (obj) => {
 *   console.log('This won\\'t run');
 * });
 *
 * // When dataObject goes out of scope, it\\'s automatically removed from WeakSet
 * ```
 *
 * @example
 * DOM element event tracking:
 * ```typescript
 * class ElementEventTracker {
 *   private listenersAttached = new WeakSet<Element>();
 *
 *   validateTracker(): boolean {
 *     return isWeakSet(this.listenersAttached);
 *   }
 *
 *   attachEventListeners(element: Element): void {
 *     if (!this.validateTracker()) {
 *       throw new Error('Event tracker must use WeakSet');
 *     }
 *
 *     if (this.listenersAttached.has(element)) {
 *       console.warn('Event listeners already attached to element');
 *       return;
 *     }
 *
 *     // Attach various event listeners
 *     element.addEventListener('click', this.handleClick);
 *     element.addEventListener('mouseover', this.handleMouseOver);
 *     element.addEventListener('mouseout', this.handleMouseOut);
 *
 *     this.listenersAttached.add(element);
 *   }
 *
 *   hasEventListeners(element: Element): boolean {
 *     if (!this.validateTracker()) {
 *       return false;
 *     }
 *
 *     return this.listenersAttached.has(element);
 *   }
 *
 *   private handleClick = (event: Event) => {
 *     console.log('Click event:', event.target);
 *   };
 *
 *   private handleMouseOver = (event: Event) => {
 *     console.log('Mouse over:', event.target);
 *   };
 *
 *   private handleMouseOut = (event: Event) => {
 *     console.log('Mouse out:', event.target);
 *   };
 * }
 *
 * // Usage
 * const tracker = new ElementEventTracker();
 * const button = document.createElement('button');
 *
 * tracker.attachEventListeners(button);
 * console.log(tracker.hasEventListeners(button)); // true
 *
 * // When button is removed from DOM and loses references,
 * // it\\'s automatically removed from WeakSet
 * ```
 *
 * @example
 * Circular reference detection:
 * ```typescript
 * class CircularReferenceDetector {
 *   private visiting = new WeakSet<object>();
 *
 *   validateDetector(): boolean {
 *     return isWeakSet(this.visiting);
 *   }
 *
 *   hasCircularReference(obj: any): boolean {
 *     if (!this.validateDetector()) {
 *       throw new Error('Detector must use WeakSet for visited tracking');
 *     }
 *
 *     return this.checkCircular(obj);
 *   }
 *
 *   private checkCircular(obj: any, path: string = 'root'): boolean {
 *     if (obj === null || typeof obj !== 'object') {
 *       return false; // Primitives can\\'t have circular references
 *     }
 *
 *     if (this.visiting.has(obj)) {
 *       console.log(`Circular reference detected at: ${path}`);
 *       return true;
 *     }
 *
 *     this.visiting.add(obj);
 *
 *     try {
 *       for (const [key, value] of Object.entries(obj)) {
 *         if (this.checkCircular(value, `${path}.${key}`)) {
 *           return true;
 *         }
 *       }
 *
 *       return false;
 *     } finally {
 *       this.visiting.delete(obj);
 *     }
 *   }
 * }
 *
 * // Usage
 * const detector = new CircularReferenceDetector();
 *
 * const obj1: any = { name: 'obj1' };
 * const obj2: any = { name: 'obj2', ref: obj1 };
 * obj1.ref = obj2; // Create circular reference
 *
 * console.log(detector.hasCircularReference(obj1)); // true
 * ```
 *
 * @example
 * Memory-efficient object validation:
 * ```typescript
 * interface Validator {
 *   validatedObjects: unknown;
 * }
 *
 * class ObjectValidator implements Validator {
 *   validatedObjects = new WeakSet<object>();
 *
 *   validateStorage(): boolean {
 *     return isWeakSet(this.validatedObjects);
 *   }
 *
 *   validate(obj: object, rules: Array<(obj: any) => boolean>): boolean {
 *     if (!this.validateStorage()) {
 *       throw new Error('Validated objects must be tracked in WeakSet');
 *     }
 *
 *     // Skip validation if already validated
 *     if (this.validatedObjects.has(obj)) {
 *       return true;
 *     }
 *
 *     // Run validation rules
 *     const isValid = rules.every(rule => {
 *       try {
 *         return rule(obj);
 *       } catch {
 *         return false;
 *       }
 *     });
 *
 *     if (isValid) {
 *       this.validatedObjects.add(obj);
 *     }
 *
 *     return isValid;
 *   }
 *
 *   isValidated(obj: object): boolean {
 *     if (!this.validateStorage()) {
 *       return false;
 *     }
 *
 *     return this.validatedObjects.has(obj);
 *   }
 * }
 *
 * // Usage
 * const validator = new ObjectValidator();
 * const userData = { name: 'John', age: 30, email: 'john@example.com' };
 *
 * const rules = [
 *   (obj: any) => typeof obj.name === 'string' && obj.name.length > 0,
 *   (obj: any) => typeof obj.age === 'number' && obj.age > 0,
 *   (obj: any) => typeof obj.email === 'string' && obj.email.includes('@')
 * ];
 *
 * const isValid = validator.validate(userData, rules);
 * console.log('Is valid:', isValid); // true
 * console.log('Is cached:', validator.isValidated(userData)); // true
 * ```
 *
 * @example
 * System resource cleanup tracking:
 * ```typescript
 * class ResourceCleanupTracker {
 *   private cleanedResources = new WeakSet<object>();
 *
 *   validateTracker(): boolean {
 *     return isWeakSet(this.cleanedResources);
 *   }
 *
 *   markAsCleaned(resource: object): void {
 *     if (!this.validateTracker()) {
 *       throw new Error('Cleanup tracker must use WeakSet');
 *     }
 *
 *     this.cleanedResources.add(resource);
 *   }
 *
 *   needsCleanup(resource: object): boolean {
 *     if (!this.validateTracker()) {
 *       return true; // Assume cleanup needed if tracker invalid
 *     }
 *
 *     return !this.cleanedResources.has(resource);
 *   }
 *
 *   cleanupResource(resource: any): void {
 *     if (!this.needsCleanup(resource)) {
 *       console.log('Resource already cleaned up');
 *       return;
 *     }
 *
 *     // Perform cleanup operations
 *     if (resource.close && typeof resource.close === 'function') {
 *       resource.close();
 *     }
 *
 *     if (resource.dispose && typeof resource.dispose === 'function') {
 *       resource.dispose();
 *     }
 *
 *     if (resource.destroy && typeof resource.destroy === 'function') {
 *       resource.destroy();
 *     }
 *
 *     this.markAsCleaned(resource);
 *     console.log('Resource cleaned up successfully');
 *   }
 * }
 * ```
 *
 * @remarks
 * **WeakSet Characteristics:**
 * - Values must be objects (not primitives)
 * - Entries are automatically garbage collected when objects are no longer referenced
 * - No enumeration methods (no size, values(), entries(), forEach())
 * - Perfect for tracking object states without preventing garbage collection
 * - Cannot cause memory leaks through object retention
 *
 * **Key Limitations:**
 * - Values must be objects, not primitives
 * - No way to iterate over values
 * - No size property
 * - Cannot be cleared all at once
 * - Not suitable when you need to enumerate values
 *
 * **Use Cases:**
 * - Object state tracking (processed, validated, etc.)
 * - DOM element event listener tracking
 * - Circular reference detection
 * - Resource cleanup tracking
 * - Avoiding memory leaks in object processing
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isSet()` for regular Set detection
 * - Use `isWeakMap()` for WeakMap detection
 * - Use `isObject()` for general object detection
 */
export const isWeakSet = <T extends WeakSet<any>>(value: unknown): value is T =>
  value instanceof WeakSet;
