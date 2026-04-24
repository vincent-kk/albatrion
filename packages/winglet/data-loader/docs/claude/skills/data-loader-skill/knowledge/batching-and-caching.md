# Batching and Caching in @winglet/data-loader

## How Batching Works

### The Event-Loop Window

DataLoader collects keys during a single JavaScript event-loop tick. The default scheduler is `scheduleNextTick` (from `@winglet/common-utils/scheduler`), which fires after the current synchronous code completes but before I/O callbacks.

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

`maxBatchSize` must be a positive number; otherwise the constructor throws `DataLoaderError('INVALID_MAX_BATCH_SIZE')`. The default is `Infinity`.

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
// Microtask queue (faster than nextTick in most environments)
const microtaskLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => queueMicrotask(fn),
});

// setTimeout — wider batching window, more keys per batch
const timedLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => setTimeout(fn, 10),
});

// requestAnimationFrame — UI-friendly batching
const uiLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => requestAnimationFrame(fn),
});

// Immediate — no delay, useful for testing
const syncLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => fn(),
});
```

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

### Default Cache: Map

By default, a plain `Map` is used. O(1) lookups, no size limit or TTL.

```typescript
// Default — uses new Map() internally
const loader = new DataLoader(batchLoad);

// Explicit custom Map instance (e.g., to share across loaders)
const sharedMap = new Map<string, Promise<User>>();
const loader = new DataLoader(batchLoad, { cache: sharedMap });
```

Any object implementing `get`/`set`/`delete`/`clear` (the `MapLike` interface) is accepted. Missing methods throw `DataLoaderError('INVALID_CACHE')`.

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
users.forEach(user => userLoader.prime(user.id, user));

// Prime with an Error to mark a key as permanently missing
// (the rejected promise has .catch(NOOP_FUNCTION) attached internally,
//  so it never surfaces as an unhandled rejection)
userLoader.prime('deleted-id', new Error('User was deleted'));
```

## Key Deduplication

Within the same batch, duplicate keys are NOT automatically deduplicated at the key level — but the cache deduplicates at the Promise level. If `cache: false`, the same key can appear multiple times in one batch:

```typescript
// With cache enabled (default): one fetch; a wrapping Promise is returned per call
const p1 = loader.load('key');
const p2 = loader.load('key'); // cache hit — key does NOT appear twice in the batch

// With cache: false: key appears twice in batch
const p1 = noCacheLoader.load('key');
const p2 = noCacheLoader.load('key'); // both added to batch
```

## Batch Failure Clears the Cache

When a dispatch fails (loader throws, returns a non-array, or returns a wrong-length array), DataLoader:

1. Resolves any pending cache-hit callbacks for the batch.
2. For each key in the batch: **calls `clear(key)`** so subsequent `load(key)` can refetch instead of serving the failed promise.
3. Rejects every pending promise with the error.

This means a transient network failure will not "stick" a rejected promise in the cache forever — the next `load()` of that key will go through a fresh batch.
