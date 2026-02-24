# @winglet/data-loader — Usage Guide

## When to Use DataLoader

Use `@winglet/data-loader` when:

- You have a resolver or handler that loads individual items by key, and multiple callers issue those loads concurrently (GraphQL resolvers, React tree rendering, parallel service calls).
- You want to collapse N individual database/API calls into one batched call transparently.
- You want per-key promise caching to deduplicate identical concurrent requests.

Do NOT use it when:

- You already control the call site and can pass arrays directly to your data layer.
- You need real-time data and every call must bypass any cache — just use `cache: false` and call your API directly.
- Batching would introduce unacceptable latency (e.g., the scheduler delay is problematic) — use `batchScheduler: (fn) => fn()` for immediate dispatch.

---

## Minimum Working Example

```typescript
import { DataLoader } from '@winglet/data-loader';

const loader = new DataLoader(async (ids: ReadonlyArray<string>) => {
  const items = await db.findByIds([...ids]);
  return ids.map(id => items.find(i => i.id === id) ?? new Error(`${id} not found`));
});

const item = await loader.load('abc');
```

---

## Option Decision Tree

```
Do you need caching?
├── Yes (default) → omit cache option
│   ├── Do keys need custom equality? → provide cacheKeyFn
│   └── Do you want TTL or size bounds? → provide cacheMap
└── No → cache: false

Do you want to limit batch size?
├── Yes → maxBatchSize: N
└── No (default: unlimited)

Do you need immediate dispatch (no scheduler delay)?
└── batchScheduler: (fn) => fn()

Do you want to process each key individually?
└── disableBatch: true   (equivalent to maxBatchSize: 1)
```

---

## API Quick Reference

### Constructor

```typescript
new DataLoader<Key, Value, CacheKey = Key>(
  batchLoader: (keys: ReadonlyArray<Key>) => Promise<ReadonlyArray<Value | Error>>,
  options?: DataLoaderOptions<Key, Value, CacheKey>
)
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `null` | Identifier for debugging |
| `cache` | `MapLike \| false` | `new Map()` | Cache storage; `false` disables caching |
| `cacheKeyFn` | `(key: Key) => CacheKey` | identity | Derive cache key from loader key |
| `batchScheduler` | `(fn: () => void) => void` | `process.nextTick` | Controls when the batch fires |
| `maxBatchSize` | `number` | `Infinity` | Max keys per batch call |
| `disableBatch` | `true` | — | Disables batching (each key dispatches immediately) |

> `maxBatchSize` and `disableBatch` are mutually exclusive options.

### Methods

| Method | Returns | Description |
|---|---|---|
| `load(key)` | `Promise<Value>` | Load a single key; throws for nil keys |
| `loadMany(keys)` | `Promise<Array<Value \| Error>>` | Load multiple keys; errors are values, not throws |
| `clear(key)` | `this` | Remove a key from cache |
| `clearAll()` | `this` | Empty the entire cache |
| `prime(key, value)` | `this` | Seed cache with a value/Promise/Error; no-op if key exists |

---

## BatchLoader Contract

The function you pass as the first argument must satisfy:

1. Accept `ReadonlyArray<Key>` — do not mutate the input array.
2. Return `Promise<ReadonlyArray<Value | Error>>`.
3. The returned array must have **exactly the same length** as the input keys array.
4. Index `i` of the result must correspond to index `i` of the input keys.
5. Use `Error` instances (not thrown exceptions) to represent per-key failures.

Violation of rules 3 or 4 throws a `DataLoaderError` at dispatch time.

---

## Common Recipes

### Invalidate after mutation

```typescript
const updated = await api.updateUser(id, patch);
userLoader.clear(id).prime(id, updated);
```

### Warm cache from a list

```typescript
const users = await api.listUsers();
users.forEach(u => userLoader.prime(u.id, u));
```

### Per-request loaders in Express

```typescript
app.use((req, _res, next) => {
  req.loaders = { users: new DataLoader(batchLoadUsers) };
  next();
});
```

### Safe batch loader with allSettled

```typescript
const loader = new DataLoader(async (ids: ReadonlyArray<string>) => {
  const results = await Promise.allSettled(ids.map(fetchById));
  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : new Error(`Failed: ${ids[i]}`),
  );
});
```
