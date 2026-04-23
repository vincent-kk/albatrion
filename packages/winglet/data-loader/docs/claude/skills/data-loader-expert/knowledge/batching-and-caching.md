# Batching and Caching in @winglet/data-loader

## How Batching Works

### The Event-Loop Window

DataLoader collects keys during a single JavaScript event-loop tick. The default scheduler is `process.nextTick`, which fires after the current synchronous code completes but before I/O callbacks.

```
Synchronous code runs:
  userLoader.load('A')  → key added to batch, scheduler registered
  userLoader.load('B')  → key added to same batch
  userLoader.load('C')  → key added to same batch

↓ synchronous code finishes

process.nextTick fires:
  batchLoader(['A', 'B', 'C'])  → ONE call with all three keys
```

If loads happen in separate ticks (e.g., across `await` boundaries), they go into separate batches:

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

### Disabling Batching

For cases where batching is counterproductive (e.g., a loader that handles only single items):

```typescript
const singleLoader = new DataLoader(batchLoad, { disableBatch: true });
// maxBatchSize is effectively 1 — each load dispatches immediately
```

### Custom Schedulers

Replace `process.nextTick` with any scheduling function:

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
- On subsequent `load('key')` calls, the **same Promise** is returned (deduplication).
- Both calls resolve to the same value when the batch completes.

```typescript
const p1 = loader.load('user-1');
const p2 = loader.load('user-1');
// p1 === p2 is NOT guaranteed (cache hits return a new wrapping Promise)
// but both resolve to the same value — only ONE fetch occurs
```

### Default Cache: Map

By default, a plain `Map` is used. This provides O(1) key lookups but no size limit or TTL.

```typescript
// Default — uses new Map() internally
const loader = new DataLoader(batchLoad);

// Explicit custom Map instance
const sharedMap = new Map<string, Promise<User>>();
const loader = new DataLoader(batchLoad, { cache: sharedMap });
```

### Disabling the Cache

```typescript
const loader = new DataLoader(batchLoad, { cache: false });
// Every load() call goes into a batch — no deduplication
// Useful for real-time data where staleness is unacceptable
```

### Cache Invalidation

```typescript
// After a mutation, clear the stale entry
userLoader.clear('user-42');

// Optionally re-prime with fresh data
userLoader.clear('user-42').prime('user-42', updatedUser);

// Clear everything (e.g., on logout, environment switch)
userLoader.clearAll();
```

### Priming the Cache

`prime()` inserts a value without triggering a batch load. It is a no-op if the key is already cached.

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

// Prime with an error to mark a key as permanently missing
userLoader.prime('deleted-id', new Error('User was deleted'));
```

## Key Deduplication

Within the same batch, duplicate keys are NOT automatically deduplicated at the key level — but the cache deduplicates at the Promise level. If `cache: false`, the same key can appear multiple times in one batch:

```typescript
// With cache enabled (default): one fetch, same Promise returned
const p1 = loader.load('key');
const p2 = loader.load('key'); // cache hit — no duplicate in batch

// With cache: false: key appears twice in batch
const p1 = noCacheLoader.load('key');
const p2 = noCacheLoader.load('key'); // both added to batch
```
