# Advanced Patterns for @winglet/data-loader

Production concerns that the type declarations and README cannot express: loader lifetime, cache consistency after writes, and debug identity. Constructor options, `cacheKeyFn`, LRU/TTL cache shapes, and the GraphQL resolver wiring are all covered by the README — read it there rather than reconstructing them here.

## Loader Lifetime Is a Security Boundary

A DataLoader's cache has no notion of who asked. Two requests sharing one loader share every cached Promise, so a value authorized for one user is served to the next — **sharing a loader across requests leaks data between users**. There is no option that mitigates this; lifetime is the only control.

The rule: a loader instance lives exactly as long as one request. Build them in a factory and call it per request.

```typescript
// The factory — one call produces one request's worth of loaders
function createLoaders() {
  return {
    users: new DataLoader(batchLoadUsers),
    posts: new DataLoader(batchLoadPosts),
  };
}

// Apollo Server — context runs once per request
const server = new ApolloServer({
  schema,
  context: () => ({ loaders: createLoaders() }),
});
```

Two shapes to reject on sight, because both are module-scoped and therefore process-lifetime:

```typescript
// WRONG — one instance for the process; every request shares its cache
export const userLoader = new DataLoader(batchLoadUsers);

// WRONG — same defect wearing a class. The singleton service holds the loader,
// so the loader outlives the request that populated it.
class UserService {
  private loader = new DataLoader(batchLoadUsers);
}
```

The tension is real: per-request loaders throw away the cache at the end of every request, which is the intended trade. When a cache genuinely must outlive a request, put the _shared_ storage behind the `cache` option — a store you can scope, bound, and expire deliberately — and keep the loader itself per-request. Authorization must then be enforced at the fetch, not assumed from the cache.

## Post-Mutation Consistency

`prime()` writes only when the key is absent. On a key that is already cached it does nothing, and it reports nothing — so the natural post-update call is silently a no-op and the loader keeps serving pre-update data.

```typescript
// WRONG — prime() on a cached key does nothing; stale value survives
await db.updateUser(id, patch);
userLoader.prime(id, updated);

// CORRECT — clear() removes the entry, then prime() finds the slot empty
await db.updateUser(id, patch);
userLoader.clear(id).prime(id, updated);
```

`clear(id).prime(id, updated)` is the only correct replace sequence. `clear()` alone is also correct but weaker: it forces the next `load()` to refetch, paying a round-trip for data you already hold.

Ordering against the write matters as much as the sequence. Clear _after_ the write commits — clearing first leaves a window in which a concurrent `load()` repopulates the cache from the pre-write state.

### Priming a Deletion

After a delete, prime the key with an `Error` so subsequent loads fail immediately instead of issuing a doomed fetch:

```typescript
await db.deleteUser(id);
userLoader.clear(id).prime(id, new Error(`User ${id} not found`));
```

This is safe to do eagerly: `prime()` attaches an internal no-op `.catch()` to the rejected Promise, so an entry nobody ever loads does not surface as an unhandled rejection.

## Observability: Named Loaders

`name` is a readonly public field, set only through the constructor and defaulting to `null` when omitted. Nothing in the library reads it — it exists for logs, where an anonymous loader is indistinguishable from the other five in the same request.

```typescript
const userLoader = new DataLoader(batchLoadUsers, { name: 'UserLoader' });
userLoader.name; // 'UserLoader'

function reportLoadFailure(
  loader: DataLoader<any, any>,
  key: unknown,
  error: Error,
) {
  logger.error(
    `[${loader.name ?? 'DataLoader'}] failed to load ${String(key)}`,
    error,
  );
}
```

The `?? 'DataLoader'` fallback is load-bearing: the default is `null`, not the class name or an empty string, so a template literal on an unnamed loader prints `null`.

## Per-Key Error Isolation

Returning `Error` instances _inside_ the result array fails single keys without failing the batch. Throwing from the BatchLoader fails all of them — reserve that for genuinely batch-wide failures like a dead connection.

```typescript
const loader = new DataLoader(async (ids: ReadonlyArray<string>) => {
  const settled = await Promise.allSettled(ids.map((id) => fetchItem(id)));
  return settled.map((result, i) =>
    result.status === 'fulfilled'
      ? result.value
      : new Error(`Failed to load ${ids[i]}: ${result.reason}`),
  );
});

// loadMany never rejects — failures arrive as Error values, positionally
const results = await loader.loadMany(['ok-1', 'bad-1', 'ok-2']);
const items = results.filter((r): r is Item => !(r instanceof Error));
```

Note the asymmetry between the two entry points: `load()` on a key whose slot holds an `Error` rejects, while `loadMany()` catches each rejection and hands back the `Error` as a value. Code that treats `loadMany` results as values without an `instanceof Error` check will pass an `Error` object into business logic — silently, since the array's declared type is `Array<Value | Error>`.
