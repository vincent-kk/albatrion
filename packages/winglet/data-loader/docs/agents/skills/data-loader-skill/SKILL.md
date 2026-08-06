---
name: data-loader-skill
description: '@winglet/data-loader expert. Batching and caching for asynchronous data fetching: N+1 elimination, the key-ordering contract, Promise-level cache semantics, custom cache and scheduler options, per-request loader isolation, and DataLoader error codes.'
user-invocable: false
---

# @winglet/data-loader — batching and caching for asynchronous fetching

Applies when the project imports `@winglet/data-loader`, or when the question involves N+1 query elimination, request batching, per-key caching, or DataLoader-style resolvers. This package is a ground-up rewrite inspired by `graphql/dataloader`; the concepts carry over but the option names do not — see Option Names below before writing any constructor call.

## Mental Model

**One tick, one batch.** `load(key)` appends the key to the currently open batch and registers the scheduler once. Every `load()` reached within the same synchronous stretch lands in a single `BatchLoader` call. Crossing an `await` starts a new batch, so sequential awaits defeat batching entirely — issue concurrent loads (`Promise.all`, or independent resolvers) and let the scheduler collect them.

**The cache stores Promises, not values.** An entry is written the moment a key enters a batch, long before the fetch resolves. That is what makes deduplication work in-flight rather than after the fact. A cache hit hands back a _new_ Promise that wraps the cached one — so `p1 !== p2`, but only one fetch happens.

**The BatchLoader contract is positional.** The library never matches results to keys by content. Index `i` of the returned array is the answer for key `i`, and nothing else is inspected. Violating this does not raise an error — it silently hands callers another key's data.

## Decision Guide

| Situation                                                     | Choice                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Ordinary dedup within one request                             | Omit `cache` — a fresh `Map` is created                         |
| Bounded or expiring storage, or a cache shared by two loaders | `cache: <MapLike>` — any `get`/`set`/`delete`/`clear` object    |
| Value must never be served stale                              | `cache: false` — dedup off, batching still on                   |
| Backend caps how many keys one call may carry                 | `maxBatchSize: n`                                               |
| Backend accepts exactly one key per call                      | `disableBatch: true` (equivalent to `maxBatchSize: 1`)          |
| One key, failure should reject                                | `load()`                                                        |
| Many keys, partial success acceptable                         | `loadMany()` — failures arrive as `Error` _values_ in the array |
| Wider batching window than the default tick                   | `batchScheduler` (e.g. `setTimeout(fn, 10)`)                    |

## Invariants & Gotchas

### The key-ordering contract

The BatchLoader must return exactly `keys.length` results, positionally aligned with the input keys. The canonical failure is returning rows in database order:

```typescript
// WRONG — the database may reorder rows and drop missing IDs
async function wrong(ids: ReadonlyArray<string>) {
  return db.query('SELECT * FROM users WHERE id IN (?)', [[...ids]]);
}

// CORRECT — realign onto key order, one entry per key
async function correct(ids: ReadonlyArray<string>) {
  const rows = await db.query('SELECT * FROM users WHERE id IN (?)', [
    [...ids],
  ]);
  return ids.map(
    (id) => rows.find((r) => r.id === id) ?? new Error(`Not found: ${id}`),
  );
}
```

A wrong-length array or a non-array result rejects **every** pending promise in that batch with `INVALID_BATCH_LOADER`. A wrong _order_ of the correct length is not detectable and stays silent — this is why the realignment above is mandatory, not stylistic.

### Option names — critical

The option is **`cache`**, not `cacheMap`. Two independent sources push toward the wrong name, so take the shape from `dist/type.d.ts` rather than from recall or from an example:

- Upstream `graphql/dataloader` names its option `cacheMap`. Pattern-matching from that package — or from memory of it — produces the wrong name here.
- This package's own JSDoc examples use invalid options, and they ship inside the declarations a reader is most likely to open. `dist/DataLoader.d.ts` shows `cacheMap:` twice (from `src/DataLoader.ts:213` and `:334`) and an invalid `cache: true` (from `src/DataLoader.ts:55`). The same JSDoc claims `promise1 === promise2` for repeated `load()` of one key (`src/DataLoader.ts:394`), which is false — cache hits return a new wrapping Promise. The README, by contrast, is correct throughout.

```typescript
new DataLoader(batchLoad, { cache: new LRU({ max: 500 }) }); // CORRECT
new DataLoader(batchLoad, { cache: false }); // CORRECT
new DataLoader(batchLoad, { cacheMap: new LRU({ max: 500 }) }); // TS2353
new DataLoader(batchLoad, { cache: true }); // TS2322
```

TypeScript does reject both wrong forms — as an excess property on a literal, and as a whole-argument mismatch when the options come from a variable. The danger is the repair: silencing that error with `as any` (or writing the call in plain JavaScript) leaves the option ignored, and the loader quietly keeps its default `Map`. Fix the name, never the type error.

### Error surface

Every code below belongs to `DataLoaderError`, whose `code` is `DATA_LOADER.<CODE>` (`group` = `DATA_LOADER`, `specific` = the code, `name` = `DataLoader`).

| Code                      | Thrown by                   | Cause                                                                     |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `INVALID_KEY`             | `load()`, synchronously     | Key is `null` or `undefined`                                              |
| `INVALID_KEYS`            | `loadMany()`, synchronously | `keys` is not array-like                                                  |
| `INVALID_BATCH_LOADER`    | Constructor / dispatch      | Not a function, non-thenable return, non-array result, or length mismatch |
| `INVALID_MAX_BATCH_SIZE`  | Constructor                 | `maxBatchSize` is not a number, or is below 1                             |
| `INVALID_CACHE`           | Constructor                 | Custom `cache` is missing any of `get`/`set`/`delete`/`clear`             |
| `INVALID_CACHE_KEY_FN`    | Constructor                 | `cacheKeyFn` is not a function                                            |
| `INVALID_BATCH_SCHEDULER` | Constructor                 | `batchScheduler` is not a function                                        |

`DataLoaderError` and `isDataLoaderError` exist in the source but are **not exported** — the package entry point exposes only `DataLoader` and the type `DataLoaderOptions`. Match on `error.code` or `error.specific`; an `instanceof DataLoaderError` check cannot be written by a consumer.

### Common mistakes

| Mistake                                     | Correct approach                                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| BatchLoader returns values in wrong order   | Realign onto key order: `keys.map(k => byId.get(k) ?? new Error(...))`                                |
| BatchLoader returns fewer items than keys   | Return exactly `keys.length` items — a mismatch rejects the whole batch with `INVALID_BATCH_LOADER`   |
| Sharing one loader across requests          | Build loaders in a per-request factory — a shared cache serves one user's data to another             |
| `cache: false` combined with `prime()`      | `prime()`, `clear()`, and `clearAll()` are all no-ops when caching is disabled                        |
| Calling `prime()` to overwrite a cached key | `prime()` is a no-op when the key exists — `clear(key).prime(key, next)` is the only replace sequence |
| Passing `null`/`undefined` to `load()`      | Throws `INVALID_KEY` synchronously; guard before calling                                              |
| Object keys without `cacheKeyFn`            | Objects are compared by identity, so equal-shaped keys always miss — derive a string key              |
| `cacheKeyFn` that can return `''` or `0`    | A falsy cache key silently bypasses the cache in both directions — no read, no write, no dedup        |
| Awaiting loads one at a time                | Each `await` closes the batch — issue the loads concurrently, then await                              |

## Knowledge Router

| Topic                                                                                                                            | File                                |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Batch windows, `maxBatchSize`, `disableBatch`, custom schedulers, Promise-cache mechanics, `prime`/`clear`, failure-clears-cache | `knowledge/batching-and-caching.md` |
| Per-request isolation, post-mutation consistency, priming a deletion, named loaders                                              | `knowledge/advanced-patterns.md`    |

## API Truth

Read shapes; do not recall them. `DataLoaderOptions`, `BatchLoader`, and `MapLike` are declared in `dist/type.d.ts`, and the README documents every option with a worked example. The one exception to "trust the declarations" is the JSDoc examples inside `dist/DataLoader.d.ts` — see Option Names above.

The package entry exports `DataLoader` (class) and `DataLoaderOptions` (type), and nothing else. `BatchLoader` and `MapLike` can be read in `dist/type.d.ts` but not imported — the package declares no subpath exports, so annotate a batch loader with its own inline signature rather than importing the name.

```typescript
import { DataLoader } from '@winglet/data-loader';

const loader = new DataLoader<Key, Value, CacheKey>(
  async (keys) => keys.map((key) => valueOrError(key)), // BatchLoader
  {
    name, // string — readonly loader.name, defaults to null
    cache, // MapLike | false — defaults to a new Map()
    cacheKeyFn, // (key) => CacheKey — defaults to identity
    batchScheduler, // (task) => void — defaults to scheduleNextTick
    maxBatchSize, // number — defaults to Infinity
    // disableBatch: true is the mutually exclusive alternative to maxBatchSize
  },
);

loader.load(key); // Promise<Value>
loader.loadMany(keys); // Promise<Array<Value | Error>>
loader.clear(key).prime(key, value); // both return `this`; clearAll() also chains
```
