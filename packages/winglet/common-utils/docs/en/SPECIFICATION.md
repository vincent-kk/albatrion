# @winglet/common-utils — Specification

**Version:** 0.10.0
**Description:** Common utility functions for JavaScript/TypeScript projects
**License:** MIT
**Dependencies:** None (zero runtime dependencies)
**ES Target:** ES2020
**Node.js:** 14.0.0+

---

## Installation

```bash
npm install @winglet/common-utils
# or
yarn add @winglet/common-utils
```

---

## Quick Start

```typescript
// Full package import
import { chunk, isNil, clone, delay, debounce } from '@winglet/common-utils';

// Sub-path imports (recommended for tree-shaking)
import { chunk, unique, groupBy } from '@winglet/common-utils/array';
import { isNil, isEmpty, isPlainObject } from '@winglet/common-utils/filter';
import { clone, merge, equals, transformKeys } from '@winglet/common-utils/object';
import { delay, withTimeout } from '@winglet/common-utils/promise';
import { debounce, throttle } from '@winglet/common-utils/function';
```

---

## Sub-path Exports

| Sub-path | Description |
|---|---|
| `@winglet/common-utils` | All utilities |
| `@winglet/common-utils/array` | Array manipulation |
| `@winglet/common-utils/filter` | Type guards and predicates |
| `@winglet/common-utils/object` | Object manipulation |
| `@winglet/common-utils/promise` | Async/Promise utilities |
| `@winglet/common-utils/scheduler` | Task scheduling |
| `@winglet/common-utils/function` | Function enhancement |
| `@winglet/common-utils/math` | Math utilities |
| `@winglet/common-utils/hash` | Hash algorithms |
| `@winglet/common-utils/convert` | Conversion utilities |
| `@winglet/common-utils/error` | Custom error classes |
| `@winglet/common-utils/constant` | Constants |
| `@winglet/common-utils/lib` | Core library utilities |
| `@winglet/common-utils/console` | Console utilities |

---

## API Reference

### Array Utilities (`/array`)

#### at
```typescript
at(array: readonly Type[], indexes: number | number[]): Type | Type[]
```
Access elements by index. Supports negative indices (from end). Single number returns `Type`; array of numbers returns `Type[]`.

#### chunk
```typescript
chunk<Type>(array: Type[], size: number): Type[][]
```
Split array into subarrays of at most `size` elements. Returns `[array]` if `size` is not a positive integer.

#### difference / differenceBy / differenceWith / differenceLite
```typescript
difference<Type>(source: Type[], exclude: Type[]): Type[]
differenceBy<Type>(source: Type[], exclude: Type[], iteratee: (item: Type) => unknown): Type[]
differenceWith<Type>(source: Type[], exclude: Type[], comparator: (a: Type, b: Type) => boolean): Type[]
differenceLite<Type>(source: Type[], exclude: Type[]): Type[]  // optimized for < 100 elements
```
Return elements in `source` not present in `exclude`. O(n + m) for standard variants, O(n*m) for Lite.

#### filter
```typescript
filter<Type>(array: Type[], predicate: (item: Type, index: number, array: Type[]) => boolean): Type[]
```
Returns elements for which predicate returns true.

#### forEach / forEachDual / forEachReverse
```typescript
forEach<Type>(array: Type[], callback: (item: Type, index: number, array: Type[]) => void): void
forEachDual<A, B>(arrayA: A[], arrayB: B[], callback: (a: A, b: B, index: number) => void): void
forEachReverse<Type>(array: Type[], callback: (item: Type, index: number, array: Type[]) => void): void
```
Iteration utilities. `forEachDual` stops at shorter array length.

#### groupBy
```typescript
groupBy<Type, Key extends PropertyKey>(array: Type[], getKey: (item: Type) => Key): Record<Key, Type[]>
```
Groups elements by computed key. Maintains element order within groups.

#### intersection / intersectionBy / intersectionWith / intersectionLite
```typescript
intersection<Type>(source: Type[], target: Type[]): Type[]
```
Returns elements present in both arrays. Duplicates in source are preserved if they exist in target.

#### map
```typescript
map<Type, Result>(array: Type[], callback: (item: Type, index: number, array: Type[]) => Result): Result[]
```
Transform each element. Pre-allocates result array.

#### orderedMerge
Merges two sorted arrays while maintaining sort order.

#### primitiveArrayEqual
```typescript
primitiveArrayEqual(a: unknown[], b: unknown[]): boolean
```
Fast equality check for arrays of primitive values.

#### sortWithReference
```typescript
sortWithReference<Value>(source: Value[], reference?: Value[]): Value[]
```
Sorts `source` according to element order in `reference`. Non-reference elements appended at end.

#### unique / uniqueBy / uniqueWith
```typescript
unique<Type>(source: Type[]): Type[]
uniqueBy<Type>(source: Type[], iteratee: (item: Type) => unknown): Type[]
uniqueWith<Type>(source: Type[], comparator: (a: Type, b: Type) => boolean): Type[]
```
Remove duplicate elements. `unique` uses SameValueZero equality. `uniqueBy` uses key function. `uniqueWith` uses custom comparator.

---

### Filter / Type Guard Utilities (`/filter`)

All functions are TypeScript type guards unless noted.

| Function | Signature | Returns true for |
|---|---|---|
| `isNil` | `(v) => v is null \| undefined` | `null`, `undefined` |
| `isNotNil` | `(v) => v is T` | Everything except null/undefined |
| `isNull` | `(v) => v is null` | `null` |
| `isUndefined` | `(v) => v is undefined` | `undefined` |
| `isEmpty` | `(v) => boolean` | null, undefined, falsy primitives, empty objects/arrays |
| `isEmptyArray` | `(v) => v is never[]` | Empty arrays |
| `isEmptyObject` | `(v) => boolean` | Objects with no own enumerable properties |
| `isEmptyPlainObject` | `(v) => boolean` | Plain objects with no own properties |
| `isTruthy` | `(v) => v is T` | Truthy values |
| `isFalsy` | `(v) => v is Falsy` | `null`, `undefined`, `false`, `0`, `0n`, `''`, `NaN` |
| `isString` | `(v) => v is string` | Strings |
| `isNumber` | `(v) => v is number` | Numbers (including NaN) |
| `isBoolean` | `(v) => v is boolean` | Booleans |
| `isSymbol` | `(v) => v is symbol` | Symbols |
| `isInteger` | `(v) => v is number` | Safe integers |
| `isPrimitiveType` | `(v) => boolean` | Any primitive |
| `isPrimitiveObject` | `(v) => boolean` | Primitive wrapper objects |
| `isObject` | `(v) => v is object` | Non-null objects |
| `isPlainObject` | `(v) => v is Record<...>` | Plain objects `{}` |
| `isFunction` | `(v) => v is Function` | Functions |
| `isArray` | `(v) => v is unknown[]` | Arrays |
| `isArrayLike` | `(v) => boolean` | Array-like (has numeric length) |
| `isArrayIndex` | `(v) => boolean` | Valid array indices |
| `isMap` | `(v) => v is Map` | Map instances |
| `isSet` | `(v) => v is Set` | Set instances |
| `isWeakMap` | `(v) => v is WeakMap` | WeakMap instances |
| `isWeakSet` | `(v) => v is WeakSet` | WeakSet instances |
| `isDate` | `(v) => v is Date` | Date instances |
| `isRegex` | `(v) => v is RegExp` | RegExp instances |
| `isError` | `(v) => v is Error` | Error instances |
| `isPromise` | `(v) => v is Promise` | Promise instances |
| `isArrayBuffer` | `(v) => v is ArrayBuffer` | ArrayBuffer instances |
| `isSharedArrayBuffer` | `(v) => v is SharedArrayBuffer` | SharedArrayBuffer instances |
| `isTypedArray` | `(v) => boolean` | TypedArray instances |
| `isDataView` | `(v) => v is DataView` | DataView instances |
| `isBuffer` | `(v) => boolean` | Node.js Buffer instances |
| `isBlob` | `(v) => v is Blob` | Blob instances |
| `isFile` | `(v) => v is File` | File instances |
| `isCloneable` | `(v) => boolean` | Objects cloneable by `clone()` |
| `isValidRegexPattern` | `(v: string) => boolean` | Valid regex pattern strings |

---

### Object Utilities (`/object`)

#### clone
```typescript
clone<Type>(target: Type, maxDepth?: number): Type
```
Full deep clone. Handles Date, RegExp, Map, Set, TypedArray, Error, circular references, Symbol properties. `maxDepth` limits recursion depth.

#### cloneLite
```typescript
cloneLite<Type>(target: Type): Type
```
Fast deep clone for plain objects/arrays with primitive values only. No Date/Map/Set/circular reference support.

#### shallowClone
```typescript
shallowClone<Type>(target: Type): Type
```
Shallow copy of arrays or plain objects.

#### merge
```typescript
merge<Target, Source>(target: Target, source: Source): Target & Source
```
Deep recursive merge. Mutates `target`. Arrays are concatenated. No circular reference protection.

#### equals
```typescript
equals<L, R>(left: L, right: R, omit?: Set<PropertyKey> | PropertyKey[]): boolean
```
Deep equality. Handles NaN correctly. No circular reference support (stack overflow risk).

#### stableEquals
```typescript
stableEquals<L, R>(left: L, right: R): boolean
```
Circular-reference-safe deep equality. Handles all types.

#### serializeObject / serializeWithFullSortedKeys / stableSerialize
JSON serialization variants. `serializeWithFullSortedKeys` sorts keys recursively.

#### transformKeys
```typescript
transformKeys<Type, Key extends PropertyKey>(object: Type, getKey: (value, key, object) => Key): Record<Key, ...>
```
New object with transformed keys, original values unchanged.

#### transformValues
```typescript
transformValues<Type, Value>(object: Type, getValue: (value, key, object) => Value): Record<keyof Type, Value>
```
New object with transformed values, original keys unchanged.

#### Other object utilities

| Function | Description |
|---|---|
| `countKey(obj)` | Count all enumerable properties including inherited |
| `countObjectKey(obj)` | Count own enumerable properties |
| `getEmptyObject()` | Create `Object.create(null)` |
| `getFirstKey(obj)` | First own enumerable key |
| `getJSONPointer(obj, pointer)` | Get value by JSON Pointer |
| `getObjectKeys(obj)` | `Object.keys` with better typing |
| `getSymbols(obj)` | Own symbol properties |
| `hasUndefined(obj)` | True if any own property is undefined |
| `removePrototype(obj)` | Remove prototype chain in-place |
| `removeUndefined(obj)` | New object without undefined values |
| `sortObjectKeys(obj)` | New object with alphabetically sorted keys |

---

### Promise Utilities (`/promise`)

#### delay
```typescript
delay(ms?: number, options?: { signal?: AbortSignal }): Promise<void>
```
Resolves after `ms` ms (default 0). Throws `AbortError` if signal is aborted.

#### timeout
```typescript
timeout(ms: number, options?: { signal?: AbortSignal }): Promise<never>
```
Always rejects with `TimeoutError` after `ms` ms.

#### withTimeout
```typescript
withTimeout<T>(fn: () => Promise<T>, ms: number, options?: { signal?: AbortSignal }): Promise<T>
```
Races `fn()` against a timeout. Throws `TimeoutError` on timeout.

#### waitAndExecute
```typescript
waitAndExecute<T>(ms: number, fn: () => T): Promise<T>
```
Wait then execute function, returning its result.

#### waitAndReturn
```typescript
waitAndReturn<T>(ms: number, value: T): Promise<T>
```
Wait then resolve with value.

---

### Scheduler Utilities (`/scheduler`)

#### scheduleMicrotask
```typescript
scheduleMicrotask(task: () => void): void
```
Enqueue in microtask queue. Highest priority — executes before macrotasks. Uses native `queueMicrotask` or Promise fallback.

#### scheduleNextTick
```typescript
scheduleNextTick(task: () => void): void
```
Next event loop tick. Uses `process.nextTick` in Node.js, `setImmediate` or `setTimeout(0)` in browsers.

#### scheduleMacrotask / cancelMacrotask / scheduleCancelableMacrotask
```typescript
scheduleMacrotask(callback: () => void): number
cancelMacrotask(id: number): void
scheduleCancelableMacrotask(callback: () => void): () => void
```
Schedule/cancel macrotasks. Uses native `setImmediate` in Node.js, `MessageChannelScheduler` in browsers (faster than `setTimeout(0)`, automatic batching).

---

### Function Utilities (`/function`)

#### debounce
```typescript
debounce<F>(fn: F, ms: number, options?: { signal?: AbortSignal; leading?: boolean; trailing?: boolean }): DebouncedFn<F>
```
Delay execution until quiet period. Defaults: `leading: false, trailing: true`. Returns function with `.execute()` and `.clear()` methods.

#### throttle
```typescript
throttle<F>(fn: F, ms: number, options?: { signal?: AbortSignal; leading?: boolean; trailing?: boolean }): ThrottledFn<F>
```
Rate-limit execution. Defaults: `leading: true, trailing: true`. Returns function with `.execute()` and `.clear()` methods.

#### getTrackableHandler
```typescript
getTrackableHandler(fn, options): TrackableHandler
```
Wrap async function with state tracking, loading detection, and subscription support.

---

### Math Utilities (`/math`)

| Function | Signature | Description |
|---|---|---|
| `abs` | `(n) => number` | Absolute value |
| `clamp` | `(n, min, max) => number` | Clamp to range |
| `round` | `(n, decimals?) => number` | Round to decimal places |
| `sum` | `(arr) => number` | Sum of array |
| `mean` | `(arr) => number` | Arithmetic mean |
| `median` | `(arr) => number` | Median value |
| `range` | `(arr) => number` | Max minus min |
| `min` | `(arr) => number` | Minimum in array |
| `max` | `(arr) => number` | Maximum in array |
| `minLite` | `(a, b) => number` | Smaller of two values |
| `maxLite` | `(a, b) => number` | Larger of two values |
| `inRange` | `(n, min, max) => boolean` | True if min ≤ n ≤ max |
| `isClose` | `(a, b, tol?) => boolean` | Float comparison with tolerance |
| `isEven` | `(n) => boolean` | Even check |
| `isOdd` | `(n) => boolean` | Odd check |
| `isPrime` | `(n) => boolean` | Prime check |
| `gcd` | `(a, b) => number` | Greatest common divisor |
| `lcm` | `(a, b) => number` | Least common multiple |
| `digitSum` | `(n) => number` | Sum of digits |
| `factorial` | `(n) => number` | Factorial with caching |
| `fibonacci` | `(n) => number` | Fibonacci with caching |
| `combination` | `(n, r) => number` | n choose r |
| `permutation` | `(n, r) => number` | n permute r |
| `toBase` | `(n, base) => string` | Decimal to base 2–36 |
| `fromBase` | `(s, base) => number` | Base 2–36 to decimal |

---

### Hash Utilities (`/hash`)

#### Murmur3
32-bit non-cryptographic hash (MurmurHash3). Accepts `string`, `ArrayBuffer`, `Uint8Array`.

```typescript
Murmur3.hash(data, seed?)      // static one-shot
new Murmur3(data?, seed?)      // incremental: .hash().hash().result()
instance.reset(seed?)          // reuse instance
```

#### polynomialHash
```typescript
polynomialHash(target: string, length?: number): string
```
Java-style `String.hashCode()` in base36. Default length 7, max 7.

---

### Convert Utilities (`/convert`)

#### convertMsFromDuration
```typescript
convertMsFromDuration(duration: string): number
```
Parse `'5s'`, `'30m'`, `'2h'`, `'500ms'` to milliseconds. Returns `0` for invalid input.

---

### Error Classes (`/error`)

| Class | Thrown by | Inherits |
|---|---|---|
| `BaseError` | (abstract) | `Error` |
| `AbortError` | `delay()`, `withTimeout()` on abort | `BaseError` |
| `TimeoutError` | `timeout()`, `withTimeout()` on timeout | `BaseError` |
| `InvalidTypeError` | validation utilities | `BaseError` |

All errors have `.group`, `.specific`, `.code` (`"group.specific"`), `.details` properties.

---

### Core Library Utilities (`/lib`)

#### cacheMapFactory
```typescript
cacheMapFactory<M extends Map<string, any>>(defaultValue?) => CacheMap
```
Map-based cache. API: `.get()`, `.set()`, `.has()`, `.delete()`, `.clear()`, `.size()`, `.keys()`, `.values()`, `.entries()`, `.getCache()`.

#### cacheWeakMapFactory
```typescript
cacheWeakMapFactory<V, K extends object>(defaultValue?) => WeakCacheMap
```
WeakMap-based cache for object keys. Auto-GC. API: `.get()`, `.set()`, `.has()`, `.delete()`, `.getCache()`.

#### counterFactory
```typescript
counterFactory(start?: number): () => number
```
Auto-incrementing counter starting at `start` (default 0).

#### getTypeTag
```typescript
getTypeTag(value: unknown): string
```
Returns `Object.prototype.toString.call(value)` result.

#### hasOwnProperty
```typescript
hasOwnProperty(object: unknown, key: PropertyKey): boolean
```
Safe own-property check (works on null-prototype objects).

---

### Constants (`/constant`)

```typescript
// Time constants (milliseconds)
MILLISECOND = 1
SECOND      = 1_000
MINUTE      = 60_000
HOUR        = 3_600_000
DAY         = 86_400_000
```

---

## Usage Patterns

### Pagination
```typescript
import { chunk } from '@winglet/common-utils/array';

const pages = chunk(items, pageSize);
const currentPage = pages[pageIndex] ?? [];
```

### Data grouping
```typescript
import { groupBy } from '@winglet/common-utils/array';

const byStatus = groupBy(orders, o => o.status);
// { pending: [...], shipped: [...], delivered: [...] }
```

### API response normalization
```typescript
import { transformKeys } from '@winglet/common-utils/object';

const normalized = transformKeys(apiResponse, (_, key) =>
  key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
);
```

### State comparison (ignoring timestamps)
```typescript
import { equals } from '@winglet/common-utils/object';

const hasChanged = !equals(prevState, nextState, ['updatedAt', 'version']);
```

### Safe async with timeout
```typescript
import { withTimeout } from '@winglet/common-utils/promise';
import { TimeoutError } from '@winglet/common-utils/error';

try {
  const result = await withTimeout(() => fetchData(), 5000);
} catch (e) {
  if (e instanceof TimeoutError) handleTimeout();
  else throw e;
}
```

### Debounced search
```typescript
import { debounce } from '@winglet/common-utils/function';

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchAPI(query);
  updateUI(results);
}, 300);

searchInput.addEventListener('input', e => debouncedSearch(e.target.value));
```

### Memoization with Map cache
```typescript
import { cacheMapFactory } from '@winglet/common-utils/lib';

const cache = cacheMapFactory<Map<string, number>>();

function memoFib(n: number): number {
  const key = String(n);
  if (cache.has(key)) return cache.get(key)!;
  const result = n <= 1 ? n : memoFib(n - 1) + memoFib(n - 2);
  cache.set(key, result);
  return result;
}
```

### Remove empty/nil values
```typescript
import { isNotNil } from '@winglet/common-utils/filter';
import { removeUndefined } from '@winglet/common-utils/object';

const cleanArray = rawArray.filter(isNotNil);
const cleanObject = removeUndefined(rawObject);
```

---

## Compatibility

- **ES2020** syntax
- **Node.js** 14.0.0+
- **Modern browsers** with ES2020 support
- For legacy environments: transpile with Babel
- **TypeScript** 4.0+
