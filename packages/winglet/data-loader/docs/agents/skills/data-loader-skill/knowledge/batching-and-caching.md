# Batching and Caching in @winglet/data-loader

## How Batching Works

### The Event-Loop Window

DataLoader collects keys during a single JavaScript event-loop tick. The default scheduler is `scheduleNextTick` (from `@winglet/common-utils/scheduler`), which resolves at import time to `Promise.resolve().then(() => process.nextTick(task))` on Node, `setImmediate` where available, and `setTimeout(task, 0)` otherwise. All three fire after the current synchronous block, so the batching window is "everything reachable without yielding" — but the browser fallbacks yield a wider window than Node, which is why a batch size that looks stable in tests can grow in a browser.

```
Synchronous code runs:
  userLoader.load('A')  → key added to batch, scheduler registered
  userLoader.load('B')  → key added to same batch
  userLoader.load('C')  → key added to same batch

↓ synchronous code finishes

scheduler fires:
  batchLoader(['A', 'B', 'C'])  → ONE call with all three keys
```

If loads happen in separate ticks (e.g., across `await` boundaries), they land in separate batches:

```typescript
// Two separate batches
const user1 = await userLoader.load('user-1'); // batch 1
const user2 = await userLoader.load('user-2'); // batch 2 (after await)
```

### Batch Size Limits

Use `maxBatchSize` to cap the number of keys per batch (e.g., to avoid SQL `IN` clause limits):

```typescript
const loader = new DataLoader(batchLoad, { maxBatchSize: 100 });

// If 150 loads happen in one tick:
// → batch 1: batchLoad(keys[0..99])
// → batch 2: batchLoad(keys[100..149])
```

`maxBatchSize` must be a number of at least 1; otherwise the constructor throws with code `DATA_LOADER.INVALID_MAX_BATCH_SIZE`. The default is `Infinity`.

### Disabling Batching

For cases where batching is counterproductive (e.g., a loader that handles only single items):

```typescript
const singleLoader = new DataLoader(batchLoad, { disableBatch: true });
// Internally equivalent to maxBatchSize: 1 — every load() gets its own batch
// Note: still uses the scheduler; each batch simply holds one key
```

`disableBatch: true` and `maxBatchSize` are mutually exclusive in the type — pick one.

### Custom Schedulers

Replace the default `scheduleNextTick` with any scheduling function:

```typescript
// setTimeout — wider batching window, more keys per batch
const timedLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => setTimeout(fn, 10),
});

// Immediate — dispatches within the current synchronous block, so only the
// loads issued before this one are batched. Useful in tests; defeats batching.
const syncLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => fn(),
});
```

The scheduler picks the width of the batching window: anything that defers longer collects more keys per call at the cost of latency.

## How Caching Works

### Cache Stores Promises

The cache stores `Promise<Value>`, not resolved values. This means:

- On the first `load('key')`, a Promise is created and stored in the cache.
- On subsequent `load('key')` calls, a **new wrapping Promise** is returned that resolves to the cached one. The underlying fetch happens only once.

```typescript
const p1 = loader.load('user-1');
const p2 = loader.load('user-1');
// p1 !== p2 (cache hits return a new wrapping Promise),
// but both resolve to the same value — only ONE fetch occurs.
```

The wrapper is not a formality. Its resolver is parked on the _current_ batch and only runs when that batch dispatches, so a cache hit never resolves synchronously — even when the cached Promise settled several ticks ago, and even when the batch holds nothing but cache hits. That is the point: a hit and a miss issued together complete in the same phase, so resolver code cannot accidentally depend on hit-vs-miss ordering. (Because the wrapper _adopts_ the cached Promise, a hit settles a couple of microtask turns after the freshly fetched keys of its own batch.)

### Default Cache: Map

By default, a plain `Map` is used. O(1) lookups, no size limit or TTL.

```typescript
// Default — uses new Map() internally
const defaultLoader = new DataLoader(batchLoad);

// Explicit custom Map instance (e.g., to share across loaders)
const sharedMap = new Map<string, Promise<User>>();
const sharingLoader = new DataLoader(batchLoad, { cache: sharedMap });
```

Any object implementing `get`/`set`/`delete`/`clear` (the `MapLike` interface) is accepted. A missing method throws with code `DATA_LOADER.INVALID_CACHE`, naming the methods it could not find.

### Disabling the Cache

```typescript
const loader = new DataLoader(batchLoad, { cache: false });
// Every load() call goes into a batch — no deduplication
// Useful for real-time data where staleness is unacceptable
```

When `cache: false`:

- `prime()` is a no-op.
- `clear()` / `clearAll()` are no-ops.
- Duplicate keys in one tick produce duplicate entries in the batch.

### Cache Invalidation

```typescript
// After a mutation, clear the stale entry
userLoader.clear('user-42');

// Optionally re-prime with fresh data (chainable)
userLoader.clear('user-42').prime('user-42', updatedUser);

// Clear everything (e.g., on logout, environment switch)
userLoader.clearAll();
```

### Priming the Cache

`prime()` inserts a value without triggering a batch load. It is a **no-op if the key is already cached** — clear first if you need to overwrite.

```typescript
// After creating a resource, prime so subsequent loads don't fetch
async function createUser(data: CreateUserInput) {
  const user = await api.createUser(data);
  userLoader.prime(user.id, user); // future load('id') hits cache
  return user;
}

// Prime from a list response to warm the cache
const users = await api.listUsers();
users.forEach((user) => userLoader.prime(user.id, user));

// Prime with an Error to mark a key as permanently missing.
// The rejected promise gets an internal no-op .catch() attached, so an entry
// nobody ever loads still never surfaces as an unhandled rejection.
userLoader.prime('deleted-id', new Error('User was deleted'));
```

## Key Deduplication

Within the same batch, duplicate keys are NOT automatically deduplicated at the key level — but the cache deduplicates at the Promise level. If `cache: false`, the same key can appear multiple times in one batch:

```typescript
// With cache enabled (default): one fetch; a wrapping Promise is returned per call
const cached1 = loader.load('key');
const cached2 = loader.load('key'); // cache hit — key does NOT appear twice in the batch

// With cache: false: key appears twice in the batch, and the loader is called with ['key', 'key']
const uncached1 = noCacheLoader.load('key');
const uncached2 = noCacheLoader.load('key'); // both added to batch
```

## Batch Failure Clears the Cache

A dispatch fails when the loader throws, returns something without a `then`, returns a non-array, or returns an array of the wrong length. DataLoader then resolves the batch's pending cache-hit callbacks, and walks the batch keys in order — for each one **calling `clear(key)` and then rejecting that key's promise** with the error.

The per-key order matters: the cache entry is gone before the rejection is delivered. Since rejection handlers run as microtasks, the whole loop finishes first, so a `.catch()` that immediately retries always sees a clean cache. A transient network failure cannot "stick" a rejected promise in the cache — the next `load()` of that key goes through a fresh batch.
