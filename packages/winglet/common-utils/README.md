# @winglet/common-utils

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()

---

## Overview

`@winglet/common-utils` is a package that provides various utility functions useful in JavaScript/TypeScript projects.

This library offers commonly used functionalities in various areas including caching, array processing, object manipulation, Promise handling, and type checking.

---

## Installation

```bash
# Using npm
npm install @winglet/common-utils

# Using yarn
yarn add @winglet/common-utils
```

---

## Sub-path Imports

This package supports sub-path imports to enable more granular imports and optimize bundle size. You can import specific modules directly without importing the entire package:

```typescript
// Main exports
import { someUtility } from '@winglet/common-utils';
// Array utilities
import { chunk, intersection, unique } from '@winglet/common-utils/array';
// Console utilities
import { printError } from '@winglet/common-utils/console';
// Constants
import { TIME_UNITS, TYPE_TAGS } from '@winglet/common-utils/constant';
// Convert utilities
import { convertMsFromDuration } from '@winglet/common-utils/convert';
// Error classes
import { AbortError, BaseError } from '@winglet/common-utils/error';
// Filter utilities (type checking)
import {
  isArray,
  isEmpty,
  isFalsy,
  isFunction,
  isObject,
} from '@winglet/common-utils/filter';
// Function utilities
import { debounce, throttle } from '@winglet/common-utils/function';
// Hash utilities
import { Murmur3 } from '@winglet/common-utils/hash';
// Library utilities
import {
  mapCacheFactory,
  weakMapCacheFactory,
} from '@winglet/common-utils/lib';
// Object utilities
import {
  clone,
  cloneLite,
  equals,
  merge,
  shallowClone,
} from '@winglet/common-utils/object';
// Promise utilities
import { delay, timeout, withTimeout } from '@winglet/common-utils/promise';
// Scheduler utilities
import {
  scheduleMacrotask,
  scheduleMicrotask,
} from '@winglet/common-utils/scheduler';
```

### Available Sub-paths

Based on the package.json exports configuration:

- `@winglet/common-utils` - Main exports (all utilities)
- `@winglet/common-utils/lib` - Core library utilities (cache, counter, scheduler)
- `@winglet/common-utils/error` - Error classes and utilities (BaseError, AbortError, etc.)
- `@winglet/common-utils/constant` - Common constants (time, type tags, units)
- `@winglet/common-utils/filter` - Type checking and filtering utilities (isArray, isObject, isFalsy, etc.)
- `@winglet/common-utils/array` - Array manipulation utilities (chunk, unique, difference, etc.)
- `@winglet/common-utils/console` - Console utilities (printError)
- `@winglet/common-utils/convert` - Type conversion utilities (convertMsFromDuration)
- `@winglet/common-utils/function` - Function utilities (debounce, throttle, getTrackableHandler)
- `@winglet/common-utils/hash` - Hash algorithms (Murmur3)
- `@winglet/common-utils/math` - Math utilities (gcd, lcm, abs, minLite, maxLite, clamp, etc.)
- `@winglet/common-utils/object` - Object manipulation utilities (clone, cloneLite, merge, equals, etc.)
- `@winglet/common-utils/promise` - Promise utilities (delay, timeout, withTimeout, etc.)
- `@winglet/common-utils/scheduler` - Task scheduling utilities (scheduleMacrotask, scheduleMicrotask, etc.)

---

## Compatibility

This package is written using ECMAScript 2020 (ES2020) syntax.

**Supported Environments:**

- Node.js 14.0.0 or higher
- Modern browsers (with ES2020 support)

**For Legacy Environment Support:**
Use transpilers like Babel to convert the code to match your target environment.

---

## Key Features

### Constants

- Time-related constants ([time.ts](./src/constant/time.ts))
- Type tag constants ([typeTag.ts](./src/constant/typeTag.ts))
- Unit conversion constants ([unit.ts](./src/constant/unit.ts))
- Function constants ([function.ts](./src/constant/function.ts))

### Error Handling

- **[`BaseError`](./src/errors/BaseError.ts)**: Base error class
- **[`AbortError`](./src/errors/AbortError.ts)**: Error for operation abortion
- **[`InvalidTypeError`](./src/errors/InvalidTypeError.ts)**: Error for invalid types
- **[`TimeoutError`](./src/errors/TimeoutError.ts)**: Error for timeouts

### Utility Libraries (Libs)

- **[`weakMapCacheFactory`](./src/libs/cache.ts)**: Factory for WeakMap-based cache
- **[`mapCacheFactory`](./src/libs/cache.ts)**: Factory for Map-based cache
- **[`counter`](./src/libs/counter.ts)**: Utility for creating incrementing counters
- **[`getKeys`](./src/libs/getKeys.ts)**: Utility for getting object keys
- **[`getTypeTag`](./src/libs/getTypeTag.ts)**: Function to get the internal type tag of a JavaScript value
- **[`hasOwnProperty`](./src/libs/hasOwnProperty.ts)**: Function to check if an object has a specific property
- **[`random`](./src/libs/random.ts)**: Utilities for random number generation

### Utility Functions (Utils)

#### Array

- **[`at`](./src/utils/array/at.ts)**: Function to return an element at a specified index in an array
- **[`chunk`](./src/utils/array/chunk.ts)**: Function to split an array into chunks of specified size
- **[`difference`](./src/utils/array/difference.ts)**: Function to return elements in the first array that are not in other arrays
- **[`differenceBy`](./src/utils/array/differenceBy.ts)**: Function to compute the difference between arrays based on results processed by an iterator function
- **[`differenceLite`](./src/utils/array/differenceLite.ts)**: Lightweight version of difference optimized for small arrays (< 100 elements)
- **[`differenceWith`](./src/utils/array/differenceWith.ts)**: Function to compute the difference between arrays using a comparator function
- **[`forEach`](./src/utils/array/forEach.ts)**: Function to execute a given function for each element in an array
- **[`forEachDual`](./src/utils/array/forEachDual.ts)**: Function to iterate through two arrays simultaneously
- **[`forEachReverse`](./src/utils/array/forEachReverse.ts)**: Function to execute a function for each element in an array in reverse order
- **[`groupBy`](./src/utils/array/groupBy.ts)**: Function to group array elements by the result of an iterator function
- **[`intersection`](./src/utils/array/intersection.ts)**: Function to return elements that exist in all arrays
- **[`intersectionBy`](./src/utils/array/intersectionBy.ts)**: Function to compute the intersection of arrays based on results processed by an iterator function
- **[`intersectionLite`](./src/utils/array/intersectionLite.ts)**: Lightweight version of intersection optimized for small arrays (< 100 elements)
- **[`intersectionWith`](./src/utils/array/intersectionWith.ts)**: Function to compute the intersection of arrays using a comparator function
- **[`map`](./src/utils/array/map.ts)**: Function to apply a function to each element in an array and create a new array with the results
- **[`unique`](./src/utils/array/unique.ts)**: Function to remove duplicate elements from an array
- **[`uniqueBy`](./src/utils/array/uniqueBy.ts)**: Function to return unique elements based on results processed by an iterator function
- **[`uniqueWith`](./src/utils/array/uniqueWith.ts)**: Function to return unique elements using a comparator function
- **[`primitiveArrayEqual`](./src/utils/array/primitiveArrayEqual.ts)**: Function to compare two arrays for primitive value equality

#### Console

- **[`printError`](./src/utils/console/printError.ts)**: Function to print error objects to the console in a formatted way

#### Convert

- **[`convertMsFromDuration`](./src/utils/convert/convertMsFromDuration.ts)**: Function to convert a duration string (e.g., '1h30m') to milliseconds

#### DataLoader

- **[`DataLoader`](./src/utils/DataLoader/DataLoader.ts)**: Utility class for efficiently loading data by processing requests in batches and caching

#### Filter

- **[`isArray`](./src/utils/filter/isArray.ts)**: Function to check if a value is an array
- **[`isArrayBuffer`](./src/utils/filter/isArrayBuffer.ts)**: Function to check if a value is an ArrayBuffer
- **[`isArrayIndex`](./src/utils/filter/isArrayIndex.ts)**: Function to check if a value is a valid array index
- **[`isArrayLike`](./src/utils/filter/isArrayLike.ts)**: Function to check if a value is array-like
- **[`isBlob`](./src/utils/filter/isBlob.ts)**: Function to check if a value is a Blob object
- **[`isBoolean`](./src/utils/filter/isBoolean.ts)**: Function to check if a value is a Boolean
- **[`isBuffer`](./src/utils/filter/isBuffer.ts)**: Function to check if a value is a Buffer
- **[`isCloneable`](./src/utils/filter/isCloneable.ts)**: Function to check if a value can be cloned
- **[`isDataView`](./src/utils/filter/isDataView.ts)**: Function to check if a value is a DataView
- **[`isDate`](./src/utils/filter/isDate.ts)**: Function to check if a value is a Date object
- **[`isEmptyArray`](./src/utils/filter/isEmptyArray.ts)**: Function to check if an array is empty
- **[`isEmptyObject`](./src/utils/filter/isEmptyObject.ts)**: Function to check if an object is empty
- **[`isEmptyPlainObject`](./src/utils/filter/isEmptyPlainObject.ts)**: Function to check if a plain object is empty
- **[`isEmpty`](./src/utils/filter/isEmpty.ts)**: Function to comprehensively check if a value is empty (null, undefined, empty string, empty array, empty object, etc.)
- **[`isError`](./src/utils/filter/isError.ts)**: Function to check if a value is an Error object
- **[`isFile`](./src/utils/filter/isFile.ts)**: Function to check if a value is a File object
- **[`isFunction`](./src/utils/filter/isFunction.ts)**: Function to check if a value is a function
- **[`isInteger`](./src/utils/filter/isInteger.ts)**: Function to check if a value is an integer
- **[`isMap`](./src/utils/filter/isMap.ts)**: Function to check if a value is a Map object
- **[`isNil`](./src/utils/filter/isNil.ts)**: Function to check if a value is null or undefined
- **[`isNotNil`](./src/utils/filter/isNotNil.ts)**: Function to check if a value is not null or undefined
- **[`isNull`](./src/utils/filter/isNull.ts)**: Function to check if a value is null
- **[`isNumber`](./src/utils/filter/isNumber.ts)**: Function to check if a value is a number
- **[`isObject`](./src/utils/filter/isObject.ts)**: Function to check if a value is an object
- **[`isPlainObject`](./src/utils/filter/isPlainObject.ts)**: Function to check if a value is a plain object
- **[`isPrimitiveObject`](./src/utils/filter/isPrimitiveObject.ts)**: Function to check if a value is a primitive wrapper object
- **[`isPrimitiveType`](./src/utils/filter/isPrimitiveType.ts)**: Function to check if a value is a JavaScript primitive type
- **[`isPromise`](./src/utils/filter/isPromise.ts)**: Function to check if a value is a Promise
- **[`isRegex`](./src/utils/filter/isRegex.ts)**: Function to check if a value is a RegExp object
- **[`isSet`](./src/utils/filter/isSet.ts)**: Function to check if a value is a Set object
- **[`isSharedArrayBuffer`](./src/utils/filter/isSharedArrayBuffer.ts)**: Function to check if a value is a SharedArrayBuffer
- **[`isString`](./src/utils/filter/isString.ts)**: Function to check if a value is a string
- **[`isSymbol`](./src/utils/filter/isSymbol.ts)**: Function to check if a value is a Symbol
- **[`isTruthy`](./src/utils/filter/isTruthy.ts)**: Function to check if a value is truthy
- **[`isFalsy`](./src/utils/filter/isFalsy.ts)**: Function to reliably detect falsy values with TypeScript type guard support
- **[`isTypedArray`](./src/utils/filter/isTypedArray.ts)**: Function to check if a value is a TypedArray
- **[`isUndefined`](./src/utils/filter/isUndefined.ts)**: Function to check if a value is undefined
- **[`isValidRegexPattern`](./src/utils/filter/isValidRegexPattern.ts)**: Function to check if a string is a valid regex pattern
- **[`isWeakMap`](./src/utils/filter/isWeakMap.ts)**: Function to check if a value is a WeakMap object
- **[`isWeakSet`](./src/utils/filter/isWeakSet.ts)**: Function to check if a value is a WeakSet object

#### Function

##### Enhance

- **[`getTrackableHandler`](./src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts)**: Utility to create a wrapper function that can track and manage function execution state

##### Rate Limit

- **[`debounce`](./src/utils/function/rateLimit/debounce.ts)**: Function to delay execution until a certain time has passed with no additional calls
- **[`throttle`](./src/utils/function/rateLimit/throttle.ts)**: Function to limit the execution frequency to specified time intervals

#### Hash

- **[`Murmur3`](./src/utils/hash/murmur3.ts)**: Class implementing the Murmur3 hash algorithm for generating hashes from strings or byte arrays
- **[`polynomialHash`](./src/utils/hash/polynomialHash.ts)**: Function to convert a string to a base36 hash using a 31-based polynomial rolling hash algorithm

#### Math

- **[`abs`](./src/utils/math/abs.ts)**: Function to calculate the absolute value of a number with enhanced type safety
- **[`clamp`](./src/utils/math/clamp.ts)**: Function to restrict a number to be within a specified range
- **[`combination`](./src/utils/math/combination.ts)**: Function to calculate the number of combinations (n choose r) using efficient iterative method
- **[`digitSum`](./src/utils/math/digitSum.ts)**: Function to calculate the sum of all digits in an integer
- **[`factorial`](./src/utils/math/factorial.ts)**: Function to calculate the factorial of a non-negative integer with intelligent caching
- **[`fibonacci`](./src/utils/math/fibonacci.ts)**: Function to calculate the nth Fibonacci number with optimized iterative algorithm and caching
- **[`fromBase`](./src/utils/math/fromBase.ts)**: Function to convert a string representation of a number in any base (2-36) to decimal
- **[`gcd`](./src/utils/math/gcd.ts)**: Function to calculate the greatest common divisor (GCD) of two numbers using Euclidean algorithm
- **[`inRange`](./src/utils/math/inRange.ts)**: Function to check if a number falls within a specified range (inclusive)
- **[`isEven`](./src/utils/math/isEven.ts)**: Function to determine if a number is even using modulo operation
- **[`isOdd`](./src/utils/math/isOdd.ts)**: Function to determine if a number is odd with proper handling for negative numbers
- **[`isPrime`](./src/utils/math/isPrime.ts)**: Function to determine if a number is prime using optimized trial division algorithm
- **[`lcm`](./src/utils/math/lcm.ts)**: Function to calculate the least common multiple (LCM) of two numbers with precision handling
- **[`max`](./src/utils/math/max.ts)**: Function to find the maximum value in an array of numbers using optimized iteration
- **[`maxLite`](./src/utils/math/maxLite.ts)**: Function to return the larger of two numbers using simple comparison
- **[`mean`](./src/utils/math/mean.ts)**: Function to calculate the arithmetic mean (average) of an array of numbers
- **[`median`](./src/utils/math/median.ts)**: Function to calculate the median (middle value) of an array of numbers
- **[`min`](./src/utils/math/min.ts)**: Function to find the minimum value in an array of numbers using optimized iteration
- **[`minLite`](./src/utils/math/minLite.ts)**: Function to return the smaller of two numbers using simple comparison
- **[`permutation`](./src/utils/math/permutation.ts)**: Function to calculate the number of permutations (n permute r) using iterative method
- **[`range`](./src/utils/math/range.ts)**: Function to calculate the range (difference between maximum and minimum) of an array of numbers
- **[`round`](./src/utils/math/round.ts)**: Function to round a number to a specified number of decimal places
- **[`sum`](./src/utils/math/sum.ts)**: Function to calculate the sum of all numbers in an array using optimized iteration
- **[`toBase`](./src/utils/math/toBase.ts)**: Function to convert a decimal integer to its string representation in any base (2-36)

#### Object

- **[`clone`](./src/utils/object/clone.ts)**: Function to create a deep copy of an object
- **[`cloneLite`](./src/utils/object/cloneLite.ts)**: Function to create high-performance deep clones of simple data structures (primitives, plain objects, and arrays)
- **[`countKey`](./src/utils/object/countKey.ts)**: Function to count all enumerable properties including inherited ones
- **[`countObjectKey`](./src/utils/object/countObjectKey.ts)**: Function to count only own enumerable properties of an object
- **[`equals`](./src/utils/object/equals.ts)**: Function to compare the equality of two objects
- **[`getEmptyObject`](./src/utils/object/getEmptyObject.ts)**: Function to create a truly empty object with no prototype chain
- **[`getFirstKey`](./src/utils/object/getFirstKey.ts)**: Function to retrieve the first enumerable property key from an object
- **[`getJSONPointer`](./src/utils/object/getJSONPointer.ts)**: Function to get a value from an object using a JSON Pointer
- **[`getObjectKeys`](./src/utils/object/getObjectKeys.ts)**: Function to return all keys of an object as an array
- **[`getSymbols`](./src/utils/object/getSymbols.ts)**: Function to return all symbol properties of an object as an array
- **[`hasUndefined`](./src/utils/object/hasUndefined.ts)**: Function to check if an object has undefined values
- **[`merge`](./src/utils/object/merge.ts)**: Function to merge multiple objects
- **[`removePrototype`](./src/utils/object/removePrototype.ts)**: Function to remove the prototype chain from an existing object
- **[`removeUndefined`](./src/utils/object/removeUndefined.ts)**: Function to remove properties with undefined values from an object
- **[`serializeNative`](./src/utils/object/serializeNative.ts)**: Function to serialize basic JavaScript objects to JSON strings
- **[`serializeObject`](./src/utils/object/serializeObject.ts)**: Function to serialize objects to JSON strings
- **[`serializeWithFullSortedKeys`](./src/utils/object/serializeWithFullSortedKeys.ts)**: Function to serialize objects to JSON strings with sorted keys
- **[`shallowClone`](./src/utils/object/shallowClone.ts)**: Function to create shallow copies of arrays and plain objects, preserving references for nested structures
- **[`sortObjectKeys`](./src/utils/object/sortObjectKeys.ts)**: Function to sort an object's keys alphabetically
- **[`stableEquals`](./src/utils/object/stableEquals.ts)**: Function to compare the equality of two objects in a stable way
- **[`stableSerialize`](./src/utils/object/stableSerialize.ts)**: Function to serialize objects in a stable way
- **[`transformKeys`](./src/utils/object/transformKeys.ts)**: Function to apply a transformation function to all keys of an object
- **[`transformValues`](./src/utils/object/transformValues.ts)**: Function to apply a transformation function to all values of an object

#### Promise

- **[`delay`](./src/utils/promise/delay.ts)**: Function to return a Promise that resolves after waiting for a specified time
- **[`timeout`](./src/utils/promise/timeout.ts)**: Function to return a Promise that rejects with a timeout error after a specified time
- **[`withTimeout`](./src/utils/promise/withTimeout.ts)**: Function to add a timeout to a Promise, causing an error if it doesn't complete within the specified time
- **[`waitAndExecute`](./src/utils/promise/waitAndExecute.ts)**: Function to execute a function after waiting for a specified time
- **[`waitAndReturn`](./src/utils/promise/waitAndReturn.ts)**: Function to return a value after waiting for a specified time

#### Scheduler

- **[`MessageChannelScheduler`](./src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts)**: Scheduler class that uses MessageChannel to control macro tasks in a fine-grained manner
  - **[`setImmediate`](./src/utils/scheduler/MessageChannelScheduler/handler.ts)**: Function to schedule a macro task using MessageChannelScheduler
  - **[`clearImmediate`](./src/utils/scheduler/MessageChannelScheduler/handler.ts)**: Function to cancel a scheduled macro task using MessageChannelScheduler
  - **[`getPendingCount`](./src/utils/scheduler/MessageChannelScheduler/handler.ts)**: Function to get the number of pending macro tasks using MessageChannelScheduler
  - **[`destroyGlobalScheduler`](./src/utils/scheduler/MessageChannelScheduler/handler.ts)**: Function to destroy the global MessageChannelScheduler
- **[`scheduleMacrotask`](./src/utils/scheduler/scheduleMacrotask.ts)**: Function to schedule a task in the macrotask queue
- **[`cancelMacrotask`](./src/utils/scheduler/scheduleMacrotask.ts)**: Function to cancel a scheduled macrotask
- **[`scheduleCancelableMacrotask`](./src/utils/scheduler/scheduleMacrotask.ts)**: Function to schedule a cancelable macrotask
- **[`scheduleMicrotask`](./src/utils/scheduler/scheduleMicrotask.ts)**: Function to schedule a task in the microtask queue
- **[`scheduleNextTick`](./src/utils/scheduler/scheduleNextTick.ts)**: Function to schedule a task for the next tick, similar to Node.js's process.nextTick

---

## Usage Examples

### Using Cache Utilities

```typescript
import { mapCacheFactory, weakMapCacheFactory } from '@winglet/common-utils';

// Create a WeakMap-based cache
const objectCache = weakMapCacheFactory<string>();
const myObject = { id: 1 };
objectCache.set(myObject, 'cached value');
console.log(objectCache.get(myObject)); // 'cached value'

// Create a Map-based cache
const stringCache = mapCacheFactory<Map<string, number>>();
stringCache.set('key1', 100);
console.log(stringCache.get('key1')); // 100
```

### Using Promise Utilities

```typescript
import { delay, withTimeout } from '@winglet/common-utils';

// Using the delay function
async function delayExample() {
  console.log('Start');
  await delay(1000); // Wait for 1 second
  console.log('After 1 second');
}

// Adding a timeout to a Promise
async function fetchWithTimeout(url: string) {
  const fetchPromise = fetch(url);
  return withTimeout(fetchPromise, 5000); // Add a 5-second timeout
}
```

### Using Array Utilities

```typescript
import { array } from '@winglet/common-utils';

// Example code:
const chunks = array.chunk([1, 2, 3, 4, 5, 6], 2);
console.log(chunks); // [[1, 2], [3, 4], [5, 6]]
```

### Using Function Tracking Utilities

```typescript
import { getTrackableHandler } from '@winglet/common-utils';

// Example of tracking async function execution state
const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const trackableFetchUser = getTrackableHandler(fetchUserData, {
  preventConcurrent: true, // Prevent concurrent execution
  initialState: { loading: false },
  beforeExecute: (args, stateManager) => {
    stateManager.update({ loading: true });
  },
  afterExecute: (args, stateManager) => {
    stateManager.update({ loading: false });
  },
});

// Subscribe to state changes
trackableFetchUser.subscribe(() => {
  console.log('Current state:', trackableFetchUser.state);
});

// Execute function
await trackableFetchUser('user123');
console.log('Loading state:', trackableFetchUser.loading); // false
```

---

## Development Setup

```bash
# Clone repository
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# Install dependencies
nvm use && yarn install && yarn run:all build

# Development build
yarn commonUtils build

# Run tests
yarn commonUtils test
```

---

## License

This project is licensed under the MIT License. See the \*\*[`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
