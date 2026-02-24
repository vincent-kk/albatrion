# @winglet/data-loader — Specification

**Version**: 0.10.0
**Package**: `@winglet/data-loader`
**Description**: Batching and caching utility for async data fetching, inspired by GraphQL DataLoader

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
   - [DataLoader class](#dataloader-class)
   - [DataLoaderOptions](#dataloaderoptions)
   - [BatchLoader](#batchloader)
   - [MapLike](#maplike)
   - [Types](#types)
5. [Usage Patterns](#usage-patterns)
   - [Solving the N+1 Problem](#solving-the-n1-problem)
   - [Caching Strategies](#caching-strategies)
6. [Advanced Examples](#advanced-examples)

---

## Installation

```bash
npm install @winglet/data-loader
yarn add @winglet/data-loader
pnpm add @winglet/data-loader
```

**Requirements**: Node.js 14.0.0+ or a modern browser with ES2020 support.

---

## Quick Start

```typescript
import { DataLoader } from '@winglet/data-loader';

// 1. Define a batch loader function
async function batchLoadUsers(ids: ReadonlyArray<string>) {
  const users = await db.query('SELECT * FROM users WHERE id IN (?)', [[...ids]]);
  // Results MUST be returned in the same order as the input keys
  return ids.map(id => users.find(u => u.id === id) ?? new Error(`User ${id} not found`));
}

// 2. Create a DataLoader instance
const userLoader = new DataLoader(batchLoadUsers);

// 3. Load individual items — they are automatically batched
const [user1, user2, user3] = await Promise.all([
  userLoader.load('user-1'),
  userLoader.load('user-2'),
  userLoader.load('user-3'),
]);
// → Only ONE database query is issued
```

---

## Architecture

### Overview

`@winglet/data-loader` is structured around three concerns:

| Layer | Files | Responsibility |
|---|---|---|
| Public API | `DataLoader.ts`, `index.ts` | User-facing class and exports |
| Configuration | `utils/prepare.ts` | Option validation and defaults |
| Batch execution | `utils/dispatch.ts` | Batch lifecycle and error dispatch |
| Error types | `utils/error.ts` | `DataLoaderError` definition |

### Batching Mechanism

Batching relies on the JavaScript event loop. When `load(key)` is called:

1. The key is appended to the **current batch**.
2. If no scheduler is pending, one is registered using the configured `batchScheduler` (default: `process.nextTick`).
3. All `load()` calls that occur synchronously within the same tick are accumulated into the same batch.
4. When the scheduler fires, `__dispatchBatch__` calls the `BatchLoader` with all accumulated keys.

```
Tick N (synchronous):
  load('A') → append to batch, register nextTick
  load('B') → append to batch (scheduler already pending)
  load('C') → append to batch

Tick N+1 (nextTick):
  batchLoader(['A', 'B', 'C'])  ← single call
```

Calls that span `await` boundaries fall into separate batches.

### Caching Mechanism

- The cache stores `Promise<Value>` entries, keyed by the result of `cacheKeyFn(key)`.
- On the **first** `load(key)`, a Promise is created, stored in the cache, and added to the batch.
- On **subsequent** `load(key)` calls, the cached Promise is retrieved and wrapped in a new Promise that resolves to it — this is a **cache hit** and does not add to the batch.
- `prime(key, value)` inserts directly into the cache without triggering a batch load.

### Error Propagation

- If the `BatchLoader` throws synchronously or returns a non-Promise, all keys in the batch are rejected via `failedDispatch` and their cache entries are cleared.
- If the resolved array has a different length than the keys array, all keys are rejected with a `DataLoaderError`.
- If an individual result is an `Error` instance, the corresponding key's Promise is rejected with that error.

---

## API Reference

### DataLoader class

```typescript
class DataLoader<Key = string, Value = any, CacheKey = Key> {
  readonly name: string | null;

  constructor(
    batchLoader: BatchLoader<Key, Value>,
    options?: DataLoaderOptions<Key, Value, CacheKey>,
  );

  load(key: Key): Promise<Value>;
  loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>;
  clear(key: Key): this;
  clearAll(): this;
  prime(key: Key, value: Value | Promise<Value> | Error): this;
}
```

#### `load(key: Key): Promise<Value>`

Loads the value for a single key. The load is automatically coalesced into the current batch and the result is cached.

- **Throws** `DataLoaderError` (code `INVALID_KEY`) if `key` is `null` or `undefined`.
- Returns the same Promise for a given key within the same cache scope (deduplication).

```typescript
const user = await userLoader.load('user-42');
```

#### `loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>`

Loads values for multiple keys. Per-key failures are returned as `Error` instances in the result array rather than causing a thrown exception, enabling partial success.

- **Throws** `DataLoaderError` (code `INVALID_KEYS`) if `keys` is not array-like.
- Each element is either a resolved `Value` or an `Error`.

```typescript
const results = await userLoader.loadMany(['user-1', 'user-2', 'missing']);
// results[2] is an Error instance, not thrown
const users = results.filter((r): r is User => !(r instanceof Error));
```

#### `clear(key: Key): this`

Removes the cache entry for the specified key. Returns `this` for method chaining. No-op if caching is disabled.

```typescript
userLoader.clear('user-42'); // invalidate after mutation
```

#### `clearAll(): this`

Empties the entire cache. Returns `this` for method chaining. No-op if caching is disabled.

```typescript
userLoader.clearAll(); // e.g., on user logout
```

#### `prime(key: Key, value: Value | Promise<Value> | Error): this`

Manually seeds the cache for a key. No-op if:
- Caching is disabled (`cache: false`).
- The key already has a cached entry.

Accepts a plain value, a Promise, or an Error. Returns `this` for method chaining.

```typescript
userLoader.prime('user-1', fetchedUser);            // plain value
userLoader.prime('user-2', somePromise);            // Promise
userLoader.prime('deleted', new Error('Not found')); // Error
```

---

### DataLoaderOptions

```typescript
type DataLoaderOptions<Key, Value, CacheKey = Key> = {
  name?: string;
  cache?: MapLike<CacheKey, Promise<Value>> | false;
  batchScheduler?: (task: () => void) => void;
  cacheKeyFn?: (key: Key) => CacheKey;
} & (
  | { maxBatchSize?: number }
  | { disableBatch: true }
);
```

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `null` | Optional label for the loader, accessible via `loader.name`. Useful for logging and debugging. |
| `cache` | `MapLike<CacheKey, Promise<Value>> \| false` | `new Map()` | Custom cache implementation. Pass `false` to disable caching entirely. |
| `batchScheduler` | `(task: () => void) => void` | `process.nextTick` | Controls when the batch is dispatched. Replace with `queueMicrotask`, `setTimeout`, `requestAnimationFrame`, or `fn => fn()` for immediate dispatch. |
| `cacheKeyFn` | `(key: Key) => CacheKey` | identity (`k => k`) | Converts a loader key to a cache key. Required when keys are objects (reference equality would fail). |
| `maxBatchSize` | `number` | `Infinity` | Maximum number of keys per batch. When exceeded, a new batch is started automatically. Must be a positive integer. |
| `disableBatch` | `true` | — | Disables batching; each `load()` call dispatches immediately (equivalent to `maxBatchSize: 1`). Mutually exclusive with `maxBatchSize`. |

---

### BatchLoader

```typescript
type BatchLoader<Key, Value> = (
  keys: ReadonlyArray<Key>,
) => Promise<ReadonlyArray<Value | Error>>;
```

The function passed as the first argument to the `DataLoader` constructor.

**Contract**:
1. Receives a read-only array of keys — do not mutate it.
2. Must return a `Promise` that resolves to an array.
3. The returned array must have **exactly the same length** as the input keys array.
4. The value at index `i` must correspond to the key at index `i`.
5. Use `Error` instances (not thrown exceptions) to represent per-key failures.

Violating rules 3 or 4 causes all keys in the affected batch to be rejected with a `DataLoaderError`.

---

### MapLike

```typescript
type MapLike<Key, Value> = {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): any;
  delete(key: Key): any;
  clear(): any;
};
```

The interface that any custom cache implementation must satisfy. The native `Map` class satisfies this interface. Compatible with LRU caches, Redis adapters, and other stores as long as these four methods are present.

---

### Types

```typescript
// Re-exported from @winglet/data-loader
import type { DataLoaderOptions } from '@winglet/data-loader';

// Internal types (not exported, for reference)
type Batch<Key, Value> = {
  isResolved: boolean;
  keys: Array<Key>;
  promises: Array<{ resolve: (value: Value) => void; reject: (error: Error) => void }>;
  cacheHits?: Array<() => void>;
};
```

---

## Usage Patterns

### Solving the N+1 Problem

The N+1 problem arises when a list of items requires loading a related resource per item:

```typescript
// WITHOUT DataLoader — N+1 queries
async function getPosts() {
  const posts = await db.findAllPosts();           // 1 query
  return Promise.all(
    posts.map(post => db.findUser(post.authorId)), // N queries
  );
}

// WITH DataLoader — 2 queries total regardless of N
const userLoader = new DataLoader(async (ids: ReadonlyArray<string>) => {
  const users = await db.findUsersByIds([...ids]);
  return ids.map(id => users.find(u => u.id === id) ?? new Error(`Not found: ${id}`));
});

async function getPosts() {
  const posts = await db.findAllPosts();      // 1 query
  return Promise.all(
    posts.map(post => userLoader.load(post.authorId)), // 1 batched query
  );
}
```

#### GraphQL Resolver Pattern

```typescript
// Create per-request loaders to avoid cross-request cache leakage
function createLoaders() {
  return {
    users: new DataLoader(batchLoadUsers),
    posts: new DataLoader(batchLoadPosts),
  };
}

const resolvers = {
  Post: {
    author: (_post, _args, { loaders }) => loaders.users.load(_post.authorId),
  },
  User: {
    posts: (_user, _args, { loaders }) => loaders.posts.load(_user.id),
  },
};

// Express middleware — fresh loaders per request
app.use('/graphql', (req, res, next) => {
  graphqlHTTP({ schema, context: { loaders: createLoaders() } })(req, res, next);
});
```

---

### Caching Strategies

#### Default (Map — unbounded)

Suitable for short-lived request contexts (e.g., GraphQL resolvers, REST handlers). Cache lives only as long as the loader instance.

```typescript
const loader = new DataLoader(batchLoad); // uses new Map() internally
```

#### Disabled Cache

Use when data changes frequently and stale reads are unacceptable. Batching still occurs; only deduplication is removed.

```typescript
const realtimeLoader = new DataLoader(batchLoad, { cache: false });
```

#### TTL-Based Cache

```typescript
class TtlMap<K, V> {
  private store = new Map<K, { value: V; expiresAt: number }>();
  constructor(private ttlMs: number) {}
  get(key: K) {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) { this.store.delete(key); return undefined; }
    return e.value;
  }
  set(key: K, value: V) { this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs }); }
  delete(key: K) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

const cachedLoader = new DataLoader(batchLoad, {
  cacheMap: new TtlMap(60_000), // 1-minute TTL
});
```

#### Post-Mutation Consistency

```typescript
async function updateUser(id: string, patch: Partial<User>) {
  const updated = await api.patch(`/users/${id}`, patch);
  // Invalidate stale entry, then seed with fresh data
  userLoader.clear(id).prime(id, updated);
  return updated;
}
```

---

## Advanced Examples

### maxBatchSize for Large Datasets

```typescript
// Prevents SQL IN clauses exceeding database limits
const userLoader = new DataLoader(batchLoadUsers, { maxBatchSize: 100 });
// 250 concurrent loads → 3 batches: 100 + 100 + 50
```

### Custom Scheduler

```typescript
// Immediate dispatch — useful in testing or latency-sensitive code
const testLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => fn(),
});

// Wider batching window — more keys per batch
const timedLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => setTimeout(fn, 10),
});
```

### Object Keys with cacheKeyFn

```typescript
interface SearchKey { term: string; page: number; limit: number }

const searchLoader = new DataLoader<SearchKey, SearchResult[], string>(
  async (queries) => Promise.all(queries.map(q => search(q))),
  {
    cacheKeyFn: ({ term, page, limit }) => `${term}:${page}:${limit}`,
  },
);
```

### Error Handling with loadMany

```typescript
const results = await loader.loadMany(ids);

const { successes, failures } = results.reduce(
  (acc, result, i) => {
    if (result instanceof Error) {
      acc.failures.push({ id: ids[i], error: result });
    } else {
      acc.successes.push(result);
    }
    return acc;
  },
  { successes: [] as Value[], failures: [] as { id: string; error: Error }[] },
);
```

### Disabling Batch for Singleton Loaders

```typescript
// Each load dispatches immediately — no coalescing
const immediateLoader = new DataLoader(batchLoad, { disableBatch: true });
```
