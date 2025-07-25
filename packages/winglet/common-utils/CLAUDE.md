# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Build the library
yarn build        # Builds both JS bundles (ESM/CJS) and TypeScript declarations
yarn build:types  # Build TypeScript declarations only

# Testing
yarn test         # Run all tests with Vitest
yarn test src/utils/array/__tests__/chunk.test.ts  # Run specific test file
yarn test --coverage  # Run tests with coverage report

# Code Quality
yarn lint         # Run ESLint on TypeScript files in src/

# Version Management
yarn version:patch   # Bump patch version
yarn version:minor   # Bump minor version
yarn version:major   # Bump major version

# Publishing
yarn build:publish:npm  # Build and publish to npm
yarn publish:npm        # Publish to npm with public access
```

## Architecture Overview

### Modular Structure
The library is organized into distinct utility categories, each exported as sub-paths for optimal tree-shaking:

- **Constants** (`src/constant/`) - Common constants (time units, type tags, units)
- **Errors** (`src/errors/`) - Custom error classes with inheritance hierarchy
- **Core Libraries** (`src/libs/`) - Fundamental utilities (caching, type checking, random generation)
- **Utility Functions** (`src/utils/`) - Categorized utility functions

### Sub-path Export System
The package uses a sophisticated export system allowing granular imports:

```typescript
// Main exports (everything)
import { chunk, isArray } from '@winglet/common-utils';

// Category-specific imports (optimized)
import { chunk, unique } from '@winglet/common-utils/array';
import { isArray, isObject } from '@winglet/common-utils/filter';
import { debounce, throttle } from '@winglet/common-utils/function';
```

### Utility Categories

#### 1. Array Utilities (`src/utils/array/`)
Comprehensive array manipulation functions:
- **Transformation**: `chunk`, `map`, `groupBy`, `sortWithReference`
- **Filtering**: `filter`, `unique`, `uniqueBy`, `uniqueWith`
- **Set Operations**: `difference`, `intersection` (with By/With variants)
- **Iteration**: `forEach`, `forEachDual`, `forEachReverse`

#### 2. Type Checking/Filter Utilities (`src/utils/filter/`)
Extensive type checking predicates:
- **Primitive Types**: `isString`, `isNumber`, `isBoolean`, `isSymbol`
- **Object Types**: `isObject`, `isPlainObject`, `isArray`, `isDate`, `isRegex`
- **Browser APIs**: `isBlob`, `isFile`, `isDataView`, `isArrayBuffer`
- **Advanced Checks**: `isArrayLike`, `isCloneable`, `isValidRegexPattern`
- **Utility Checks**: `isNil`, `isNotNil`, `isTruthy`, `isEmptyArray`

#### 3. Object Utilities (`src/utils/object/`)
Object manipulation and comparison:
- **Deep Operations**: `clone`, `merge`, `equals`, `stableEquals`
- **Serialization**: `serializeObject`, `stableSerialize`, `serializeWithFullSortedKeys`
- **Transformation**: `transformKeys`, `transformValues`, `sortObjectKeys`
- **Utilities**: `removeUndefined`, `hasUndefined`, `getObjectKeys`, `getSymbols`

#### 4. Function Utilities (`src/utils/function/`)
Function enhancement and rate limiting:
- **Rate Limiting**: `debounce`, `throttle` with configurable options
- **Enhancement**: `getTrackableHandler` for state-aware async function wrappers
- **Tracking**: Advanced function execution tracking with subscription patterns

#### 5. Promise Utilities (`src/utils/promise/`)
Async operation helpers:
- **Timing**: `delay`, `timeout`, `withTimeout`
- **Execution**: `waitAndExecute`, `waitAndReturn`

#### 6. Scheduler Utilities (`src/utils/scheduler/`)
Task scheduling with different queue priorities:
- **Macrotask**: `scheduleMacrotask`, `scheduleCancelableMacrotask`
- **Microtask**: `scheduleMicrotask`
- **Next Tick**: `scheduleNextTick` (Node.js-style)

#### 7. Hash Utilities (`src/utils/hash/`)
Hashing algorithms:
- **Murmur3**: Full implementation with customizable seed
- **Polynomial Hash**: Base36 hash with 31-based polynomial rolling

#### 8. Core Libraries (`src/libs/`)
Fundamental building blocks:
- **Caching**: `cacheMapFactory`, `cacheWeakMapFactory` for performance optimization
- **Type Inspection**: `getTypeTag`, `getKeys`, `hasOwnProperty`
- **Counters**: `counterFactory` for generating incrementing counters
- **Random**: `getRandomNumber`, `getRandomString`, `getRandomBoolean`

### Error Hierarchy
Custom error classes with inheritance:
- **BaseError** - Foundation error class
- **AbortError** - For operation cancellation
- **InvalidTypeError** - For type validation failures
- **TimeoutError** - For timeout scenarios

## Build Configuration

### Rollup Setup
The library uses Rollup with shared build configuration from `../../aileron/script/build/rollup.transpile.mjs`:
- **Dual Format**: Produces both ESM (.mjs) and CommonJS (.cjs) outputs
- **TypeScript**: Full type declaration generation with path aliasing
- **Entrypoints**: Automatically generates sub-path exports from package.json

### TypeScript Configuration
- **Path Mapping**: Uses `@/common-utils` alias for internal imports
- **Declaration**: Separate tsconfig for declaration generation with `tsc-alias`
- **ES Target**: ES2020 for modern JavaScript features

### Testing Environment
- **Vitest**: Modern test runner with globals enabled
- **Node Environment**: Tests run in Node.js context
- **Coverage**: HTML, text, and JSON coverage reports
- **Path Alias**: `@/common-utils` resolves to `./src` in tests

## Development Patterns

### Test-Driven Development
Each utility function has comprehensive tests:
- Located in `__tests__` directories alongside source files
- Follow naming pattern: `functionName.test.ts`
- Include edge cases, error conditions, and type validation
- Use descriptive test names explaining the expected behavior

### Type Safety
The library emphasizes strong typing:
- All functions have explicit parameter and return types
- Extensive use of generic types for flexibility
- Type guards for runtime type checking
- Conditional types for advanced type inference

### Performance Considerations
- **Tree Shaking**: Sub-path exports enable optimal bundle sizes
- **Lazy Evaluation**: Cache factories and computed properties
- **Memory Efficiency**: WeakMap usage where appropriate
- **Algorithm Efficiency**: Optimized implementations (e.g., Murmur3 hash)

### Function Design Philosophy
- **Pure Functions**: Most utilities are side-effect free
- **Consistent APIs**: Similar functions follow consistent parameter patterns
- **Error Handling**: Predictable error throwing with custom error types
- **Documentation**: Comprehensive JSDoc comments with examples

## Key Dependencies

The library has minimal external dependencies:
- **@aileron/declare**: Internal type declarations
- **Development**: Rollup, TypeScript, Vitest for build and testing
- **No Runtime Dependencies**: Self-contained utility functions

## Common Usage Patterns

### Caching Strategies
```typescript
// WeakMap for object keys (automatic garbage collection)
const objectCache = cacheWeakMapFactory<string>();

// Map for primitive keys (manual management)
const stringCache = cacheMapFactory<number>();
```

### Function Enhancement
```typescript
// Create trackable async function with state management
const trackableFetch = getTrackableHandler(fetchData, {
  preventConcurrent: true,
  initialState: { loading: false },
  beforeExecute: (args, state) => state.update({ loading: true }),
  afterExecute: (args, state) => state.update({ loading: false })
});
```

### Type Checking Chains
```typescript
// Robust type validation chains
if (isObject(value) && !isNil(value) && hasOwnProperty(value, 'key')) {
  // Safe to access value.key
}
```

### Array Processing Pipelines
```typescript
// Functional programming style with utilities
const result = unique(
  intersection(array1, array2)
).map(item => transformItem(item));
```

This architecture promotes modularity, type safety, and performance while maintaining a consistent API across all utility categories.