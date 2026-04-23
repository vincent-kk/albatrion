# Getting Started with @winglet/data-loader

## Installation

```bash
npm install @winglet/data-loader
# or
yarn add @winglet/data-loader
# or
pnpm add @winglet/data-loader
```

**Requirements**: Node.js 14+ or a modern browser with ES2020 support.

## Your First DataLoader

A DataLoader requires exactly one argument: a **BatchLoader function**.

```typescript
import { DataLoader } from '@winglet/data-loader';

// Step 1: Define a batch loader
// - Receives an array of keys (collected over one event-loop tick)
// - Must return a Promise of an array with the SAME LENGTH as keys
// - Each position must correspond to the same-index key
async function batchLoadUsers(ids: ReadonlyArray<string>) {
  const rows = await db.query(
    'SELECT * FROM users WHERE id IN (?)',
    [[...ids]],
  );
  // Map results back to key order — critical!
  return ids.map(id => rows.find(r => r.id === id) ?? new Error(`User ${id} not found`));
}

// Step 2: Create the loader
const userLoader = new DataLoader(batchLoadUsers);

// Step 3: Use it — each load() call is batched automatically
const user = await userLoader.load('user-42');
```

## The Key Ordering Rule

This is the single most important constraint: **the BatchLoader must return results in the same order as the input keys, with exactly `keys.length` elements.**

```typescript
// Input:  ['id-1', 'id-2', 'id-3']
// Output: [value1, value2, value3]   ← same positions, same length

// WRONG — returning in database order (may differ)
async function wrong(ids: ReadonlyArray<string>) {
  return db.query('SELECT * FROM users WHERE id IN (?)', [[...ids]]);
  // Database may return rows in any order, or skip missing IDs!
}

// CORRECT — sort results to match key order
async function correct(ids: ReadonlyArray<string>) {
  const rows = await db.query('SELECT * FROM users WHERE id IN (?)', [[...ids]]);
  return ids.map(id => rows.find(r => r.id === id) ?? new Error(`Not found: ${id}`));
}
```

If the returned array length differs from `keys.length`, or the returned value is not array-like, DataLoader throws `DataLoaderError('INVALID_BATCH_LOADER')` and rejects every pending promise in that batch.

## Key Constraints

- Keys must be **non-null and non-undefined**. Passing `null` or `undefined` throws `DataLoaderError('INVALID_KEY')` synchronously.
- Keys are compared by **identity** (like a `Map` key) unless you provide a `cacheKeyFn`.
- Object keys require `cacheKeyFn` to work correctly since `{} !== {}`.

```typescript
// Object keys need cacheKeyFn
interface ProductKey { id: string; locale: string }

const productLoader = new DataLoader<ProductKey, Product, string>(
  batchLoadProducts,
  {
    cacheKeyFn: (key) => `${key.id}:${key.locale}`,
  },
);
```

## Loading Patterns

```typescript
// Single key
const user = await userLoader.load('user-1');

// Multiple keys — partial failure safe
const results = await userLoader.loadMany(['user-1', 'user-2', 'missing-id']);
// results[2] is an Error value in the array, NOT a thrown exception

// Concurrent loads — automatically batched into ONE request
const [a, b, c] = await Promise.all([
  userLoader.load('user-1'),
  userLoader.load('user-2'),
  userLoader.load('user-3'),
]);
```

## What Happens Without DataLoader

```typescript
// Without DataLoader: 3 separate queries
const user1 = await db.query('SELECT * FROM users WHERE id = ?', ['user-1']);
const user2 = await db.query('SELECT * FROM users WHERE id = ?', ['user-2']);
const user3 = await db.query('SELECT * FROM users WHERE id = ?', ['user-3']);

// With DataLoader: 1 batched query
const [user1, user2, user3] = await Promise.all([
  userLoader.load('user-1'),
  userLoader.load('user-2'),
  userLoader.load('user-3'),
]);
// → SELECT * FROM users WHERE id IN ('user-1', 'user-2', 'user-3')
```

## Error Surface Quick Reference

| Error code | Thrown by | Cause |
|---|---|---|
| `INVALID_KEY` | `load()` | Key is `null` or `undefined` |
| `INVALID_KEYS` | `loadMany()` | `keys` is not array-like |
| `INVALID_BATCH_LOADER` | Constructor / dispatch | BatchLoader not a function, non-Promise return, non-array result, or length mismatch |
| `INVALID_MAX_BATCH_SIZE` | Constructor | `maxBatchSize` not a positive number |
| `INVALID_CACHE` | Constructor | Custom `cache` is missing `get`/`set`/`delete`/`clear` |
| `INVALID_CACHE_KEY_FN` | Constructor | `cacheKeyFn` is not a function |
| `INVALID_BATCH_SCHEDULER` | Constructor | `batchScheduler` is not a function |

All are instances of `DataLoaderError` (detectable with `isDataLoaderError(err)`).
