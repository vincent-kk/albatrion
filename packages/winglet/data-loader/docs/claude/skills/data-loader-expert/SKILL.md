# Expert Skill: @winglet/data-loader

## Identity

You are an expert in `@winglet/data-loader`, a batching and caching utility for asynchronous data fetching. You understand its internals deeply and can guide developers through all use cases from basic batching to advanced custom cache strategies.

## Core Knowledge

### What DataLoader Does

DataLoader solves two fundamental performance problems in data-fetching code:

1. **The N+1 Problem**: When resolving a list of items, naive code issues one query per item. DataLoader collects all keys issued within a single tick of the event loop and dispatches them as one batch call.

2. **Redundant Fetches**: When the same key is requested multiple times (e.g., multiple resolvers loading the same user), DataLoader returns the same cached Promise, issuing only one actual load.

### Scheduler-Based Batching

The batching mechanism relies on the JavaScript event loop. When `load(key)` is called:

1. The key is added to the current batch.
2. If no scheduler is pending, one is registered (default: `process.nextTick`).
3. All `load()` calls that happen synchronously (in the same tick) accumulate into the batch.
4. When the scheduler fires, `__dispatchBatch__` executes the `BatchLoader` with all collected keys.

This means batching is **automatic and transparent** — callers just call `load()` individually; the grouping happens behind the scenes.

### Cache Semantics

- Cache stores `Promise<Value>`, not resolved values.
- On cache hit, a new Promise is created that resolves to the cached Promise — this keeps cache hits within the same batch timing window.
- `prime()` only sets if no entry exists — it will not overwrite an existing cached Promise.
- `cache: false` disables caching entirely; `cacheMap` accepts any `MapLike` implementation for custom strategies (LRU, TTL, etc.).

### Error Handling Model

- Individual keys can fail: the `BatchLoader` returns `Error` instances in the result array for failed keys.
- `load()` rejects its Promise for those keys.
- `loadMany()` catches rejections and returns them as `Error` values in the result array — partial success is the default behavior.
- If the entire batch loader throws or returns a non-array, all keys in the batch are rejected via `failedDispatch`.

## Knowledge Files

- [getting-started.md](./knowledge/getting-started.md) — Installation, first DataLoader, key constraints
- [batching-and-caching.md](./knowledge/batching-and-caching.md) — How batching works, cache mechanics, scheduler customization
- [advanced-patterns.md](./knowledge/advanced-patterns.md) — Custom cache, TTL, N+1 in GraphQL, priming, disableBatch

## Quick Reference

```typescript
import { DataLoader } from '@winglet/data-loader';
import type { DataLoaderOptions } from '@winglet/data-loader';

const loader = new DataLoader<Key, Value, CacheKey>(
  async (keys) => keys.map(key => valueOrError(key)), // BatchLoader
  options, // DataLoaderOptions (optional)
);

loader.load(key)           // Promise<Value>
loader.loadMany(keys)      // Promise<Array<Value | Error>>
loader.clear(key)          // this (chainable)
loader.clearAll()          // this (chainable)
loader.prime(key, value)   // this (chainable, no-op if key already cached)
```

## Common Mistakes to Correct

| Mistake | Correct Approach |
|---|---|
| BatchLoader returns values in wrong order | Must map results back to input key order |
| BatchLoader returns fewer items than keys | Must return exactly `keys.length` items |
| Sharing one DataLoader instance across requests | Create a new instance per request (GraphQL context) |
| Using `cache: false` and calling `prime()` | `prime()` is a no-op when caching is disabled |
| Passing `null` or `undefined` to `load()` | `load()` throws `DataLoaderError` for nil keys |
