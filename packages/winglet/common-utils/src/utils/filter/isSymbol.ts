/**
 * Determines whether a value is a symbol type with enhanced type safety.
 *
 * Provides reliable symbol type detection using native typeof check,
 * identifying ES6+ symbol primitives used for unique property keys
 * and meta-programming scenarios.
 *
 * @param value - Value to test for symbol type
 * @returns Type-safe boolean indicating whether the value is a symbol
 *
 * @example
 * Basic symbol detection:
 * ```typescript
 * import { isSymbol } from '@winglet/common-utils';
 *
 * // True cases - symbol type
 * console.log(isSymbol(Symbol())); // true
 * console.log(isSymbol(Symbol('description'))); // true
 * console.log(isSymbol(Symbol.for('global'))); // true
 * console.log(isSymbol(Symbol.iterator)); // true
 * console.log(isSymbol(Symbol.toStringTag)); // true
 *
 * // False cases - not symbol type
 * console.log(isSymbol('symbol')); // false (string)
 * console.log(isSymbol('Symbol()')); // false (string)
 * console.log(isSymbol({})); // false (object)
 * console.log(isSymbol(null)); // false
 * console.log(isSymbol(undefined)); // false
 * console.log(isSymbol(42)); // false (number)
 * console.log(isSymbol(true)); // false (boolean)
 * ```
 *
 * @example
 * Object property management:
 * ```typescript
 * interface MetaObject {
 *   [key: string | symbol]: any;
 * }
 *
 * function separateProperties(obj: MetaObject) {
 *   const stringKeys: string[] = [];
 *   const symbolKeys: symbol[] = [];
 *   const stringProps: Record<string, any> = {};
 *   const symbolProps: Record<symbol, any> = {};
 *
 *   // Get all property keys including symbols
 *   const allKeys = [
 *     ...Object.keys(obj),
 *     ...Object.getOwnPropertySymbols(obj)
 *   ];
 *
 *   for (const key of allKeys) {
 *     if (isSymbol(key)) {
 *       symbolKeys.push(key);
 *       symbolProps[key] = obj[key];
 *     } else {
 *       stringKeys.push(key as string);
 *       stringProps[key] = obj[key];
 *     }
 *   }
 *
 *   return {
 *     stringKeys,
 *     symbolKeys,
 *     stringProps,
 *     symbolProps
 *   };
 * }
 *
 * // Usage
 * const hiddenKey = Symbol('hidden');
 * const obj = {
 *   name: 'John',
 *   age: 30,
 *   [hiddenKey]: 'secret data',
 *   [Symbol.toStringTag]: 'CustomObject'
 * };
 *
 * const separated = separateProperties(obj);
 * console.log('String keys:', separated.stringKeys); // ['name', 'age']
 * console.log('Symbol keys:', separated.symbolKeys); // [Symbol(hidden), Symbol.toStringTag]
 * ```
 *
 * @example
 * Symbol registry management:
 * ```typescript
 * class SymbolRegistry {
 *   private registry = new Map<string, symbol>();
 *
 *   getOrCreate(key: string): symbol {
 *     if (!this.registry.has(key)) {
 *       this.registry.set(key, Symbol(key));
 *     }
 *     return this.registry.get(key)!;
 *   }
 *
 *   isRegistered(value: unknown): boolean {
 *     if (!isSymbol(value)) {
 *       return false;
 *     }
 *
 *     return Array.from(this.registry.values()).includes(value);
 *   }
 *
 *   getDescription(value: unknown): string | undefined {
 *     if (!isSymbol(value)) {
 *       return undefined;
 *     }
 *
 *     return value.description;
 *   }
 *
 *   listAll(): Array<{ key: string; symbol: symbol; description?: string }> {
 *     return Array.from(this.registry.entries()).map(([key, symbol]) => ({
 *       key,
 *       symbol,
 *       description: symbol.description
 *     }));
 *   }
 * }
 *
 * // Usage
 * const registry = new SymbolRegistry();
 * const userKey = registry.getOrCreate('user');
 * const adminKey = registry.getOrCreate('admin');
 *
 * console.log(registry.isRegistered(userKey)); // true
 * console.log(registry.getDescription(userKey)); // 'user'
 * ```
 *
 * @example
 * Serialization handling:
 * ```typescript
 * function serializeWithSymbols(obj: any): string {
 *   const symbolMap = new Map<symbol, string>();
 *   let symbolCounter = 0;
 *
 *   function replacer(key: string, value: any): any {
 *     if (isSymbol(value)) {
 *       const symbolId = `__symbol_${symbolCounter++}`;
 *       symbolMap.set(value, symbolId);
 *       return {
 *         __type: 'symbol',
 *         __id: symbolId,
 *         __description: value.description
 *       };
 *     }
 *
 *     return value;
 *   }
 *
 *   const serialized = JSON.stringify(obj, replacer, 2);
 *
 *   return JSON.stringify({
 *     data: JSON.parse(serialized),
 *     symbolMap: Array.from(symbolMap.entries()).map(([symbol, id]) => ({
 *       id,
 *       description: symbol.description
 *     }))
 *   });
 * }
 *
 * function deserializeWithSymbols(serialized: string): any {
 *   const parsed = JSON.parse(serialized);
 *   const symbolMap = new Map<string, symbol>();
 *
 *   // Recreate symbols
 *   for (const item of parsed.symbolMap) {
 *     symbolMap.set(item.id, Symbol(item.description));
 *   }
 *
 *   function reviver(key: string, value: any): any {
 *     if (value && typeof value === 'object' && value.__type === 'symbol') {
 *       return symbolMap.get(value.__id);
 *     }
 *     return value;
 *   }
 *
 *   return JSON.parse(JSON.stringify(parsed.data), reviver);
 * }
 * ```
 *
 * @example
 * Type-safe property access:
 * ```typescript
 * const PRIVATE_DATA = Symbol('privateData');
 * const META_INFO = Symbol('metaInfo');
 *
 * interface EnhancedObject {
 *   name: string;
 *   [PRIVATE_DATA]: { secret: string };
 *   [META_INFO]: { created: Date; version: string };
 * }
 *
 * function getPrivateData(obj: any, key: unknown): any {
 *   if (!isSymbol(key)) {
 *     throw new Error('Private data key must be a symbol');
 *   }
 *
 *   if (!(key in obj)) {
 *     throw new Error('Private data not found');
 *   }
 *
 *   return obj[key];
 * }
 *
 * function setPrivateData(obj: any, key: unknown, value: any): void {
 *   if (!isSymbol(key)) {
 *     throw new Error('Private data key must be a symbol');
 *   }
 *
 *   obj[key] = value;
 * }
 *
 * // Usage
 * const user: EnhancedObject = {
 *   name: 'John',
 *   [PRIVATE_DATA]: { secret: 'hidden value' },
 *   [META_INFO]: { created: new Date(), version: '1.0' }
 * };
 *
 * const privateData = getPrivateData(user, PRIVATE_DATA);
 * console.log(privateData); // { secret: 'hidden value' }
 * ```
 *
 * @example
 * Well-known symbol handling:
 * ```typescript
 * function analyzeWellKnownSymbols(obj: any) {
 *   const wellKnownSymbols = [
 *     Symbol.iterator,
 *     Symbol.toStringTag,
 *     Symbol.hasInstance,
 *     Symbol.species,
 *     Symbol.toPrimitive,
 *     Symbol.asyncIterator
 *   ];
 *
 *   const found: Array<{ symbol: symbol; description: string; hasImplementation: boolean }> = [];
 *
 *   for (const sym of wellKnownSymbols) {
 *     if (isSymbol(sym)) {
 *       found.push({
 *         symbol: sym,
 *         description: sym.description || 'unknown',
 *         hasImplementation: sym in obj
 *       });
 *     }
 *   }
 *
 *   return found;
 * }
 *
 * // Usage
 * const customIterable = {
 *   [Symbol.iterator]: function* () {
 *     yield 1;
 *     yield 2;
 *     yield 3;
 *   },
 *   [Symbol.toStringTag]: 'CustomIterable'
 * };
 *
 * const analysis = analyzeWellKnownSymbols(customIterable);
 * console.log(analysis);
 * ```
 *
 * @remarks
 * **Symbol Characteristics:**
 * - Every symbol is unique, even with same description
 * - Symbols are not enumerable in for-in loops
 * - JSON.stringify ignores symbol properties
 * - Symbol.for() creates global symbols
 * - Symbols can't be auto-converted to strings
 *
 * **Well-known Symbols:**
 * - `Symbol.iterator` - defines default iterator
 * - `Symbol.toStringTag` - customizes Object.prototype.toString
 * - `Symbol.hasInstance` - customizes instanceof behavior
 * - `Symbol.species` - constructor function for derived objects
 * - `Symbol.toPrimitive` - conversion to primitive value
 *
 * **Use Cases:**
 * - Private object properties
 * - Meta-programming
 * - Protocol implementation (iterators, etc.)
 * - Unique constants/enums
 * - Library internal properties
 * - Object tagging and identification
 *
 * **Performance:** Direct typeof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `Symbol()` to create unique symbols
 * - Use `Symbol.for()` for global symbol registry
 * - Use `Object.getOwnPropertySymbols()` to get symbol properties
 * - Use `isString()` for string property keys
 */
export const isSymbol = (value: unknown): value is symbol =>
  typeof value === 'symbol';
